#!/usr/bin/env python3
#TODO could be replaced with base64 and curl commands?

import os
import sys
import requests
import base64
import string
import random


BISQUE_ENDPOINT = os.environ.get('BISQUE_ENDPOINT')
BISQUE_USERNAME = os.environ.get('BISQUE_USERNAME')
BISQUE_PASSWORD = os.environ.get('BISQUE_PASSWORD')


def generate_xml_body(username, email):
    password = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(12))
    xml = """
    <user name="{0}">
        <tag name="password" value="{1}" />
        <tag name="email" value="{2}"/>
        <tag name="display_name" value="{3}"/>
    </user>
    """.format(username, password, email, username)
    return xml


def bisque_create_user(username, email):
    # add the user directly to the bisque server
    print("Making HTTP call to add user", username, "to Bisque...")
    xml = generate_xml_body(username, email)
    authorization = base64.b64encode("{0}:{1}".format(
        BISQUE_USERNAME,
        BISQUE_PASSWORD
    ).encode())
    headers = {
        "Content-Type": "application/xml",
        "Authorization": "Basic {0}".format(authorization)
    }
    request = requests.post(BISQUE_ENDPOINT, data=xml, headers=headers)


if __name__ == "__main__":
    username = sys.argv[1]
    email = sys.argv[2]
    bisque_create_user(username, email)
