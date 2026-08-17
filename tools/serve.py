#!/usr/bin/env python3
"""Dev server with no-cache headers so the browser always gets fresh files."""
import functools
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    def log_message(self, *args):
        pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8321
directory = sys.argv[2] if len(sys.argv) > 2 else '.'
handler = functools.partial(NoCacheHandler, directory=directory)
print(f'serving {directory} on :{port} (no-cache)')
ThreadingHTTPServer(('', port), handler).serve_forever()
