#!/usr/bin/env python3
"""
Database Schema Validator for Portal2

This script validates database schema compatibility between different environments
by generating schema definitions and comparing them.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
import psycopg2
import psycopg2.extras


class DatabaseSchemaIntrospector:
    """Introspects PostgreSQL database schema and generates JSON representation."""

    def __init__(self, connection):
        self.conn = connection
        self.cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def get_schema_definition(self) -> Dict[str, Any]:
        """Generate complete schema definition."""
        schema = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "postgresql_version": self._get_postgresql_version(),
                "database_name": self._get_database_name()
            },
            "tables": self._get_all_tables(),
            "indexes": self._get_all_indexes(),
            "constraints": self._get_all_constraints(),
            "foreign_keys": self._get_all_foreign_keys(),
            "sequences": self._get_all_sequences()
        }
        return schema

    def _get_postgresql_version(self) -> str:
        """Get PostgreSQL version."""
        self.cursor.execute("SELECT version();")
        return self.cursor.fetchone()['version']

    def _get_database_name(self) -> str:
        """Get current database name."""
        self.cursor.execute("SELECT current_database();")
        return self.cursor.fetchone()['current_database']

    def _get_all_tables(self) -> Dict[str, Any]:
        """Get all tables with their columns and properties."""
        query = """
        SELECT
            t.table_name,
            t.table_type,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default,
            c.character_maximum_length,
            c.numeric_precision,
            c.numeric_scale,
            c.ordinal_position
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position;
        """

        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        tables = {}
        for row in rows:
            table_name = row['table_name']
            if table_name not in tables:
                tables[table_name] = {
                    'table_type': row['table_type'],
                    'columns': []
                }

            if row['column_name']:  # Skip tables with no columns
                column_info = {
                    'name': row['column_name'],
                    'data_type': row['data_type'],
                    'is_nullable': row['is_nullable'],
                    'column_default': row['column_default'],
                    'ordinal_position': row['ordinal_position']
                }

                # Add optional attributes if they exist
                if row['character_maximum_length']:
                    column_info['character_maximum_length'] = row['character_maximum_length']
                if row['numeric_precision']:
                    column_info['numeric_precision'] = row['numeric_precision']
                if row['numeric_scale']:
                    column_info['numeric_scale'] = row['numeric_scale']

                tables[table_name]['columns'].append(column_info)

        return tables

    def _get_all_indexes(self) -> Dict[str, Any]:
        """Get all indexes."""
        query = """
        SELECT
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;
        """

        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        indexes = {}
        for row in rows:
            table_name = row['tablename']
            if table_name not in indexes:
                indexes[table_name] = []

            indexes[table_name].append({
                'name': row['indexname'],
                'definition': row['indexdef']
            })

        return indexes

    def _get_all_constraints(self) -> Dict[str, Any]:
        """Get all table constraints."""
        query = """
        SELECT
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            cc.check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.check_constraints cc
            ON tc.constraint_name = cc.constraint_name
            AND tc.table_schema = cc.constraint_schema
        WHERE tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name;
        """

        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        constraints = {}
        for row in rows:
            table_name = row['table_name']
            if table_name not in constraints:
                constraints[table_name] = []

            constraint_info = {
                'name': row['constraint_name'],
                'type': row['constraint_type'],
            }

            if row['column_name']:
                constraint_info['column'] = row['column_name']
            if row['check_clause']:
                constraint_info['check_clause'] = row['check_clause']

            constraints[table_name].append(constraint_info)

        return constraints

    def _get_all_foreign_keys(self) -> Dict[str, Any]:
        """Get all foreign key relationships."""
        query = """
        SELECT
            kcu.table_name,
            kcu.column_name,
            kcu.constraint_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.constraint_column_usage ccu
            ON kcu.constraint_name = ccu.constraint_name
        JOIN information_schema.table_constraints tc
            ON kcu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.table_schema = 'public'
        ORDER BY kcu.table_name, kcu.constraint_name;
        """

        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        foreign_keys = {}
        for row in rows:
            table_name = row['table_name']
            if table_name not in foreign_keys:
                foreign_keys[table_name] = []

            foreign_keys[table_name].append({
                'constraint_name': row['constraint_name'],
                'column': row['column_name'],
                'referenced_table': row['referenced_table'],
                'referenced_column': row['referenced_column']
            })

        return foreign_keys

    def _get_all_sequences(self) -> List[Dict[str, Any]]:
        """Get all sequences."""
        query = """
        SELECT
            sequence_name,
            data_type,
            start_value,
            minimum_value,
            maximum_value,
            increment
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
        ORDER BY sequence_name;
        """

        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        return [dict(row) for row in rows]


class SchemaValidator:
    """Validates database schema against a reference schema definition."""

    def __init__(self, reference_schema: Dict[str, Any]):
        self.reference_schema = reference_schema
        self.issues = []
        self.warnings = []

    def validate_against_current_schema(self, current_schema: Dict[str, Any]) -> Dict[str, Any]:
        """Validate current schema against reference schema."""
        self.issues = []
        self.warnings = []

        # Validate tables
        self._validate_tables(current_schema.get('tables', {}))

        # Validate indexes
        self._validate_indexes(current_schema.get('indexes', {}))

        # Validate constraints
        self._validate_constraints(current_schema.get('constraints', {}))

        # Validate foreign keys
        self._validate_foreign_keys(current_schema.get('foreign_keys', {}))

        # Validate sequences
        self._validate_sequences(current_schema.get('sequences', []))

        return {
            'compatible': len(self.issues) == 0,
            'issues': self.issues,
            'warnings': self.warnings,
            'summary': {
                'critical_issues': len([i for i in self.issues if i['severity'] == 'critical']),
                'minor_issues': len([i for i in self.issues if i['severity'] == 'minor']),
                'warnings': len(self.warnings)
            }
        }

    def _validate_tables(self, current_tables: Dict[str, Any]):
        """Validate table structures."""
        reference_tables = self.reference_schema.get('tables', {})

        # Check for missing tables
        for table_name, table_info in reference_tables.items():
            if table_name not in current_tables:
                self.issues.append({
                    'type': 'missing_table',
                    'severity': 'critical',
                    'table': table_name,
                    'message': f'Required table "{table_name}" is missing'
                })
                continue

            # Check columns
            self._validate_table_columns(table_name, table_info['columns'],
                                       current_tables[table_name]['columns'])

        # Check for extra tables (warnings)
        for table_name in current_tables:
            if table_name not in reference_tables:
                self.warnings.append({
                    'type': 'extra_table',
                    'table': table_name,
                    'message': f'Table "{table_name}" exists but was not in reference schema'
                })

    def _validate_table_columns(self, table_name: str, reference_columns: List[Dict],
                               current_columns: List[Dict]):
        """Validate columns within a table."""
        current_cols_by_name = {col['name']: col for col in current_columns}

        for ref_col in reference_columns:
            col_name = ref_col['name']
            if col_name not in current_cols_by_name:
                self.issues.append({
                    'type': 'missing_column',
                    'severity': 'critical',
                    'table': table_name,
                    'column': col_name,
                    'message': f'Required column "{col_name}" is missing from table "{table_name}"'
                })
                continue

            current_col = current_cols_by_name[col_name]

            # Check data type compatibility
            if ref_col['data_type'] != current_col['data_type']:
                self.issues.append({
                    'type': 'column_type_mismatch',
                    'severity': 'critical',
                    'table': table_name,
                    'column': col_name,
                    'message': f'Column "{col_name}" in table "{table_name}" has type "{current_col["data_type"]}" but expected "{ref_col["data_type"]}"'
                })

            # Check nullable constraint
            if ref_col['is_nullable'] != current_col['is_nullable']:
                severity = 'critical' if ref_col['is_nullable'] == 'NO' and current_col['is_nullable'] == 'YES' else 'minor'
                self.issues.append({
                    'type': 'column_nullable_mismatch',
                    'severity': severity,
                    'table': table_name,
                    'column': col_name,
                    'message': f'Column "{col_name}" nullable constraint differs (expected: {ref_col["is_nullable"]}, got: {current_col["is_nullable"]})'
                })

    def _validate_indexes(self, current_indexes: Dict[str, Any]):
        """Validate indexes."""
        reference_indexes = self.reference_schema.get('indexes', {})

        for table_name, ref_indexes in reference_indexes.items():
            current_table_indexes = current_indexes.get(table_name, [])
            current_index_names = {idx['name'] for idx in current_table_indexes}

            for ref_index in ref_indexes:
                if ref_index['name'] not in current_index_names:
                    self.warnings.append({
                        'type': 'missing_index',
                        'table': table_name,
                        'index': ref_index['name'],
                        'message': f'Index "{ref_index["name"]}" is missing from table "{table_name}"'
                    })

    def _validate_constraints(self, current_constraints: Dict[str, Any]):
        """Validate constraints."""
        reference_constraints = self.reference_schema.get('constraints', {})

        for table_name, ref_constraints in reference_constraints.items():
            current_table_constraints = current_constraints.get(table_name, [])
            current_constraint_names = {c['name'] for c in current_table_constraints}

            for ref_constraint in ref_constraints:
                if ref_constraint['name'] not in current_constraint_names:
                    severity = 'critical' if ref_constraint['type'] in ['PRIMARY KEY', 'UNIQUE'] else 'minor'
                    self.issues.append({
                        'type': 'missing_constraint',
                        'severity': severity,
                        'table': table_name,
                        'constraint': ref_constraint['name'],
                        'constraint_type': ref_constraint['type'],
                        'message': f'{ref_constraint["type"]} constraint "{ref_constraint["name"]}" is missing from table "{table_name}"'
                    })

    def _validate_foreign_keys(self, current_foreign_keys: Dict[str, Any]):
        """Validate foreign key relationships."""
        reference_fks = self.reference_schema.get('foreign_keys', {})

        for table_name, ref_fks in reference_fks.items():
            current_table_fks = current_foreign_keys.get(table_name, [])
            current_fk_names = {fk['constraint_name'] for fk in current_table_fks}

            for ref_fk in ref_fks:
                if ref_fk['constraint_name'] not in current_fk_names:
                    self.issues.append({
                        'type': 'missing_foreign_key',
                        'severity': 'critical',
                        'table': table_name,
                        'constraint': ref_fk['constraint_name'],
                        'message': f'Foreign key constraint "{ref_fk["constraint_name"]}" is missing from table "{table_name}"'
                    })

    def _validate_sequences(self, current_sequences: List[Dict[str, Any]]):
        """Validate sequences."""
        reference_sequences = self.reference_schema.get('sequences', [])
        current_seq_names = {seq['sequence_name'] for seq in current_sequences}

        for ref_seq in reference_sequences:
            if ref_seq['sequence_name'] not in current_seq_names:
                self.warnings.append({
                    'type': 'missing_sequence',
                    'sequence': ref_seq['sequence_name'],
                    'message': f'Sequence "{ref_seq["sequence_name"]}" is missing'
                })


def load_config(config_path: str) -> Dict[str, Any]:
    """Load portal2.json configuration."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")

    with open(config_path, 'r') as f:
        return json.load(f)


def connect_to_database(db_config: Dict[str, Any]) -> psycopg2.extensions.connection:
    """Create database connection using configuration."""
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['name'],
            user=db_config['user'],
            password=db_config['password']
        )
        conn.set_session(readonly=True)  # Ensure read-only access
        return conn
    except psycopg2.Error as e:
        raise ConnectionError(f"Failed to connect to database: {e}")


def generate_schema_command(args):
    """Handle schema generation command."""
    print(f"Loading configuration from {args.config}")
    config = load_config(args.config)

    print("Connecting to database...")
    conn = connect_to_database(config['db'])

    try:
        print("Introspecting database schema...")
        introspector = DatabaseSchemaIntrospector(conn)
        schema = introspector.get_schema_definition()

        output_file = args.output or f"schema_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        print(f"Writing schema definition to {output_file}")
        with open(output_file, 'w') as f:
            json.dump(schema, f, indent=2, default=str)

        print(f"Schema generation completed successfully!")
        print(f"Found {len(schema['tables'])} tables")

    finally:
        conn.close()


def validate_schema_command(args):
    """Handle schema validation command."""
    if not os.path.exists(args.schema):
        print(f"Error: Schema file not found: {args.schema}", file=sys.stderr)
        return 1

    print(f"Loading reference schema from {args.schema}")
    with open(args.schema, 'r') as f:
        reference_schema = json.load(f)

    print(f"Loading configuration from {args.config}")
    config = load_config(args.config)

    print("Connecting to database...")
    conn = connect_to_database(config['db'])

    try:
        print("Introspecting current database schema...")
        introspector = DatabaseSchemaIntrospector(conn)
        current_schema = introspector.get_schema_definition()

        print("Validating schema compatibility...")
        validator = SchemaValidator(reference_schema)
        result = validator.validate_against_current_schema(current_schema)

        # Generate report
        report = generate_compatibility_report(result, reference_schema['metadata'],
                                             current_schema['metadata'])

        # Write report to file if specified
        if args.report:
            with open(args.report, 'w') as f:
                f.write(report)
            print(f"Detailed report written to {args.report}")
        else:
            print(report)

        # Return appropriate exit code
        return 0 if result['compatible'] else 1

    finally:
        conn.close()


def generate_compatibility_report(result: Dict[str, Any], ref_metadata: Dict[str, Any],
                                current_metadata: Dict[str, Any]) -> str:
    """Generate a human-readable compatibility report."""
    lines = [
        "=== Database Schema Compatibility Report ===",
        "",
        f"Reference Schema: {ref_metadata.get('database_name', 'Unknown')} (generated {ref_metadata.get('generated_at', 'Unknown')})",
        f"Current Database: {current_metadata.get('database_name', 'Unknown')} (checked {current_metadata.get('generated_at', 'Unknown')})",
        "",
        f"Overall Compatibility: {'✓ COMPATIBLE' if result['compatible'] else '✗ INCOMPATIBLE'}",
        "",
        "=== Summary ===",
        f"Critical Issues: {result['summary']['critical_issues']}",
        f"Minor Issues: {result['summary']['minor_issues']}",
        f"Warnings: {result['summary']['warnings']}",
        ""
    ]

    if result['issues']:
        lines.extend([
            "=== Issues ===",
            ""
        ])
        for issue in result['issues']:
            severity_marker = "🚨" if issue['severity'] == 'critical' else "⚠️"
            lines.append(f"{severity_marker} [{issue['severity'].upper()}] {issue['message']}")
            if 'table' in issue:
                lines.append(f"   Table: {issue['table']}")
            if 'column' in issue:
                lines.append(f"   Column: {issue['column']}")
            lines.append("")

    if result['warnings']:
        lines.extend([
            "=== Warnings ===",
            ""
        ])
        for warning in result['warnings']:
            lines.append(f"⚠️  {warning['message']}")
            if 'table' in warning:
                lines.append(f"   Table: {warning['table']}")
            lines.append("")

    if result['compatible']:
        lines.extend([
            "=== Conclusion ===",
            "✅ The current database schema is compatible with the reference schema.",
            "The portal should work correctly with this database."
        ])
    else:
        lines.extend([
            "=== Conclusion ===",
            "❌ The current database schema has compatibility issues.",
            "Review and resolve the critical issues before deploying the portal."
        ])

    return "\n".join(lines)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Database Schema Validator for Portal2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate schema from QA database:
    %(prog)s generate --output qa_schema.json

  Validate production database against QA schema:
    %(prog)s validate --schema qa_schema.json --report compatibility.txt
        """
    )

    parser.add_argument(
        '--config',
        default='portal2.json',
        help='Path to portal2.json configuration file (default: portal2.json)'
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Generate command
    generate_parser = subparsers.add_parser('generate', help='Generate schema definition from database')
    generate_parser.add_argument(
        '--output',
        help='Output file path (default: schema_YYYYMMDD_HHMMSS.json)'
    )

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate database against schema definition')
    validate_parser.add_argument(
        '--schema',
        required=True,
        help='Path to reference schema JSON file'
    )
    validate_parser.add_argument(
        '--report',
        help='Output file for detailed compatibility report'
    )

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        return 1

    try:
        if args.command == 'generate':
            generate_schema_command(args)
            return 0
        elif args.command == 'validate':
            return validate_schema_command(args)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())