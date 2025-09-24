# Database Schema Validator

A Python tool for validating database schema compatibility between different Portal2 environments. This tool ensures that the QA version of the portal can work against the production database by comparing schema definitions.

## Purpose

When deploying a new version of Portal2 to production, you need to ensure that the updated application code is compatible with the existing production database. This tool helps validate that compatibility by:

1. **Generating a schema definition** from the QA database where the new portal version has been tested
2. **Validating the production database** against that schema to identify any compatibility issues

## Features

- **Read-only database access** - Never modifies the database
- **Comprehensive schema introspection** - Analyzes tables, columns, indexes, constraints, foreign keys, and sequences
- **Detailed compatibility reporting** - Identifies critical issues, minor issues, and warnings
- **CI/CD friendly** - Returns appropriate exit codes for automated validation
- **Uses existing portal2.json configuration** - No separate database configuration needed

## Installation

The tool uses `uv` for dependency management. From the `db_schema_validator` directory:

```bash
# Install dependencies
uv sync

# Or run directly with uv (it will install dependencies automatically)
uv run validate_schema.py --help
```

## Usage

### 1. Generate Schema Definition (QA Environment)

First, generate a schema definition from your QA database where the new portal version has been tested:

```bash
# Generate schema definition from QA database
uv run validate_schema.py generate --output qa_schema_v2.1.json

# Specify custom config file if needed
uv run validate_schema.py --config /path/to/qa_portal2.json generate --output qa_schema.json
```

This creates a JSON file containing the complete schema definition including:
- All tables and their columns with data types, constraints, and defaults
- Indexes and their definitions
- Primary key, foreign key, and check constraints
- Database sequences
- PostgreSQL version and generation timestamp

### 2. Validate Production Database

Then validate your production database against the QA schema:

```bash
# Validate production database against QA schema
uv run validate_schema.py validate --schema qa_schema_v2.1.json --report compatibility_report.txt

# The script uses production portal2.json by default, or specify custom config
uv run validate_schema.py --config /path/to/prod_portal2.json validate --schema qa_schema.json
```

### Exit Codes

- `0` - Database is compatible, safe to deploy
- `1` - Compatibility issues found or error occurred

### Example Workflow

```bash
# Step 1: On QA server, generate schema from tested database
uv run validate_schema.py generate --output qa_v2.1_schema.json

# Step 2: Copy schema file to production server
scp qa_v2.1_schema.json prod-server:/path/to/portal2/

# Step 3: On production server, validate before deployment
uv run validate_schema.py validate --schema qa_v2.1_schema.json --report pre_deploy_check.txt

# Step 4: Review the report and proceed if compatible
cat pre_deploy_check.txt
```

## Schema Definition Format

The generated JSON schema includes:

```json
{
  "metadata": {
    "generated_at": "2024-09-24T10:30:00",
    "postgresql_version": "PostgreSQL 13.7",
    "database_name": "portal"
  },
  "tables": {
    "account_user": {
      "table_type": "BASE TABLE",
      "columns": [
        {
          "name": "id",
          "data_type": "integer",
          "is_nullable": "NO",
          "column_default": "nextval('account_user_id_seq'::regclass)",
          "ordinal_position": 1
        }
      ]
    }
  },
  "indexes": {
    "account_user": [
      {
        "name": "account_user_pkey",
        "definition": "CREATE UNIQUE INDEX account_user_pkey ON public.account_user USING btree (id)"
      }
    ]
  },
  "constraints": { /* ... */ },
  "foreign_keys": { /* ... */ },
  "sequences": [ /* ... */ ]
}
```

## Compatibility Report

The validation generates a detailed report showing:

### Issue Severity Levels

- **Critical Issues** - Must be resolved before deployment
  - Missing required tables or columns
  - Data type mismatches
  - Missing primary keys or unique constraints
  - Missing foreign key constraints

- **Minor Issues** - Should be reviewed but may not block deployment
  - Nullable constraint differences (making nullable -> non-nullable)
  - Missing check constraints

- **Warnings** - Informational, usually safe to ignore
  - Extra tables not in reference schema
  - Missing indexes
  - Missing sequences

### Sample Report

```
=== Database Schema Compatibility Report ===

Reference Schema: portal_qa (generated 2024-09-24T09:15:00)
Current Database: portal_prod (checked 2024-09-24T10:30:00)

Overall Compatibility: ✗ INCOMPATIBLE

=== Summary ===
Critical Issues: 2
Minor Issues: 1
Warnings: 3

=== Issues ===

🚨 [CRITICAL] Required column "new_feature_flag" is missing from table "account_user"
   Table: account_user
   Column: new_feature_flag

🚨 [CRITICAL] Required table "new_feature_settings" is missing

⚠️ [MINOR] Column "email" nullable constraint differs (expected: NO, got: YES)
   Table: account_emailaddress
   Column: email

=== Conclusion ===
❌ The current database schema has compatibility issues.
Review and resolve the critical issues before deploying the portal.
```

## Configuration

The tool reads database connection settings from the standard `portal2.json` configuration file:

```json
{
  "db": {
    "host": "db.example.com",
    "port": 5432,
    "name": "portal",
    "user": "portal",
    "password": "secret"
  }
}
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
Error: Failed to connect to database: FATAL: password authentication failed
```
- Verify database credentials in portal2.json
- Ensure database server is accessible
- Check firewall and network connectivity

**Permission Denied**
```bash
Error: Failed to connect to database: FATAL: permission denied for database "portal"
```
- Ensure the database user has SELECT permissions on all tables
- The user needs access to `information_schema` and `pg_indexes` views

**Schema File Not Found**
```bash
Error: Schema file not found: qa_schema.json
```
- Verify the schema file path is correct
- Ensure the schema file was generated successfully

### Database Permissions

The tool requires minimal read-only database permissions:
- `SELECT` on all tables in the public schema
- Access to `information_schema` views (usually granted by default)
- Access to `pg_indexes` view for index information

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: Database Compatibility Check
on:
  workflow_dispatch:
    inputs:
      schema_file:
        description: 'QA Schema file path'
        required: true

jobs:
  validate-db:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install uv
        run: pip install uv

      - name: Validate Database Schema
        run: |
          cd src/scripts/db_schema_validator
          uv run validate_schema.py validate \
            --schema ${{ github.event.inputs.schema_file }} \
            --report compatibility_report.txt

      - name: Upload Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: compatibility-report
          path: src/scripts/db_schema_validator/compatibility_report.txt
```

## Development

### Running Tests

```bash
# Install development dependencies
uv sync --dev

# Run tests (when implemented)
uv run pytest
```

### Code Structure

- `validate_schema.py` - Main script and CLI interface
- `DatabaseSchemaIntrospector` - Handles database schema introspection
- `SchemaValidator` - Performs schema comparison and validation
- Schema generation, validation, and reporting functionality

## Security Considerations

- The tool connects to the database in **read-only mode**
- Database credentials are read from the existing portal2.json configuration
- No data is modified or deleted
- Schema files contain metadata but no sensitive data

## Limitations

- Only supports PostgreSQL databases
- Assumes standard `public` schema
- Does not validate stored procedures, triggers, or custom types
- Does not check data migration requirements, only schema structure