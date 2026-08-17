#!/usr/bin/env python3
"""Tiny capture server: the game page POSTs canvas.toDataURL() here and we
write it to the scratchpad as a PNG for visual verification."""
import base64
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/shot.png'

class H(BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(n).decode()
        b64 = data.split(',', 1)[1] if ',' in data else data
        path = OUT.replace('.png', f'-{self.path.strip("/") or "shot"}.png')
        with open(path, 'wb') as f:
            f.write(base64.b64decode(b64))
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        print('saved', path, flush=True)
    def log_message(self, *a):
        pass

HTTPServer(('127.0.0.1', 8322), H).serve_forever()
