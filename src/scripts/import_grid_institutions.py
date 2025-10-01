#!/usr/bin/env python3
import sys
import psycopg2
import csv
import argparse


def insert_institutions(db, fields):
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO account_institution_grid (grid_id,name,city,state,country) VALUES (%s,%s,%s,%s,%s) ON CONFLICT(grid_id) DO NOTHING",
        fields
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import GRID CSV file into database')
    parser.add_argument('-v', '--verbose', action="store_true", help='print debug info')
    parser.add_argument('--host', default='', help='the database host name or IP address')
    parser.add_argument('--port', type=int, default=5432, help='the database port number')
    parser.add_argument('--user', default='portal', help='the database username')
    parser.add_argument('--database', default='portal', help='the database name')
    parser.add_argument('--password', default=None, help='the database password')
    parser.add_argument('path', nargs=1, help='path of token data')
    args = parser.parse_args()

    conn = psycopg2.connect(host=args.host, port=args.port, user=args.user, dbname=args.database, password=args.password)

    # Load GRID CSV file
    with open(args.path[0]) as csvfile:
        gridInsitutions = list(csv.reader(csvfile))
    gridInsitutions.pop(0) # remove header

    # Create an "Other" entry with id 1
    insert_institutions(conn, ['', 'Other', '', '', ''])

    for i in gridInsitutions:
        if args.verbose:
            print(i)
        insert_institutions(conn, i)
    conn.commit()
