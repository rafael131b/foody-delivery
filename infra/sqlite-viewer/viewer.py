#!/usr/bin/env python3
"""Read-only local browser for the Foody Delivery SQLite database."""

from html import escape
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import os
import sqlite3
from urllib.parse import urlparse

DB_PATH = os.environ.get("DB_PATH", "/data/foody.db")
TABLES = {
    "orders": ("Pedidos", (
        ("id", "ID"),
        ("customer", "Cliente"),
        ("delivery_address", "Endereço"),
        ("complement", "Complemento"),
        ("items", "Itens"),
        ("status", "Status"),
        ("created_at", "Criado em"),
        ("owner_email", "Responsável"),
    )),
    "users": ("Usuários", (
        ("id", "ID"),
        ("name", "Nome"),
        ("email", "E-mail"),
        ("password_hash", "Senha (hash)"),
    )),
}
STYLE = """
:root{font-family:Inter,Segoe UI,Arial,sans-serif;color:#202633;background:#f4f6f8}
*{box-sizing:border-box}body{margin:0}.wrap{max-width:1180px;margin:auto;padding:32px 20px}
header{background:#b5121b;color:white;padding:25px 28px;border-radius:14px}
h1{margin:0 0 8px;font-size:25px}header p{margin:0;color:#ffe5e5}
.notice{margin:18px 0;padding:13px 16px;background:#fff8e8;border:1px solid #f0d99c;border-radius:9px}
h2{margin:30px 0 12px;font-size:19px}.card{background:white;border:1px solid #e2e6ea;border-radius:12px;padding:18px;margin:12px 0;overflow:hidden}
.meta{color:#687386;font-size:13px;margin:0 0 12px}.scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #edf0f2;vertical-align:top}
th{background:#f7f8fa;color:#475166;white-space:nowrap}td{max-width:420px;overflow-wrap:anywhere}
.badge{display:inline-block;background:#e8f5ed;color:#176b3a;border-radius:99px;padding:4px 9px;font-size:12px;font-weight:600}
.empty{color:#687386;text-align:center;padding:20px}.foot{color:#687386;font-size:12px;margin-top:22px}
a{color:#b5121b}
"""

def connect_read_only():
    return sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, timeout=2)

def cell(value):
    return escape("—" if value is None or value == "" else str(value))

def render_database():
    with connect_read_only() as db:
        db.execute("PRAGMA query_only = ON")
        sections = []
        for table, (title, display_columns) in TABLES.items():
            schema = db.execute(f'PRAGMA table_info("{table}")').fetchall()
            if not schema:
                continue
            schema_rows = []
            for _, name, kind, not_null, default, primary_key in schema:
                schema_rows.append(
                    "<tr>"
                    f"<td>{cell(name)}</td><td>{cell(kind or '—')}</td>"
                    f"<td>{'Sim' if not_null else 'Não'}</td>"
                    f"<td>{'Sim' if primary_key else 'Não'}</td>"
                    "</tr>"
                )
            schema_html = (
                "<div class='scroll'><table><thead><tr>"
                "<th>Coluna</th><th>Tipo</th><th>Obrigatória</th><th>Chave primária</th>"
                "</tr></thead><tbody>" + "".join(schema_rows) + "</tbody></table></div>"
            )
            columns = [name for name, _ in display_columns]
            order_by = "created_at DESC" if table == "orders" else "id ASC"
            rows = db.execute(
                f'SELECT {", ".join(chr(34) + name + chr(34) for name in columns)} '
                f'FROM "{table}" ORDER BY {order_by} LIMIT 100'
            ).fetchall()
            count = db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
            headers = "".join(f"<th>{cell(label)}</th>" for _, label in display_columns)
            rendered_rows = []
            for row in rows:
                values = []
                for (name, _), value in zip(display_columns, row):
                    if table == "users" and name == "password_hash":
                        value = "Hash armazenado" if value else "Não informado"
                    values.append(f"<td>{cell(value)}</td>")
                rendered_rows.append("<tr>" + "".join(values) + "</tr>")
            if not rendered_rows:
                rendered_rows.append(
                    f"<tr><td class='empty' colspan='{len(display_columns)}'>Nenhum registro cadastrado.</td></tr>"
                )
            data_html = (
                "<div class='scroll'><table><thead><tr>" + headers +
                "</tr></thead><tbody>" + "".join(rendered_rows) + "</tbody></table></div>"
            )
            sections.append(
                f"<section><h2>{cell(title)}</h2>"
                f"<div class='card'><p class='meta'>Estrutura da tabela</p>{schema_html}</div>"
                f"<div class='card'><p class='meta'>{count} registro(s); exibindo até 100.</p>{data_html}</div>"
                "</section>"
            )
        return (
            "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'>"
            "<meta name='viewport' content='width=device-width,initial-scale=1'>"
            "<meta http-equiv='Content-Security-Policy' content=\"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'\">"
            "<title>Foody Delivery | Banco SQLite</title>"
            f"<style>{STYLE}</style></head><body><main class='wrap'>"
            "<header><h1>Banco de dados · Foody Delivery</h1>"
            "<p>Visualização local da estrutura e dos registros do SQLite</p></header>"
            "<div class='notice'><span class='badge'>Somente leitura</span> "
            "Este painel não altera o banco. Valores de hashes de senha são ocultados.</div>"
            + "".join(sections) +
            "<p class='foot'>Acesso local em somente leitura. Não publique esta página nem exponha a porta na rede.</p>"
            "</main></body></html>"
        )

class Handler(BaseHTTPRequestHandler):
    def send_body(self, status, body, content_type="text/html; charset=utf-8"):
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            try:
                with connect_read_only() as db:
                    db.execute("SELECT 1").fetchone()
                self.send_body(200, "ok", "text/plain; charset=utf-8")
            except (sqlite3.Error, OSError):
                self.send_body(503, "database unavailable", "text/plain; charset=utf-8")
            return
        if path != "/":
            self.send_body(404, "<h1>Não encontrado</h1>")
            return
        try:
            self.send_body(200, render_database())
        except (sqlite3.Error, OSError):
            self.send_body(
                503,
                "<!doctype html><html lang='pt-BR'><meta charset='utf-8'>"
                "<title>Banco ainda não disponível</title><h1>Banco ainda não disponível</h1>"
                "<p>Verifique se a API já iniciou e criou o SQLite; depois atualize esta página.</p></html>",
            )

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)

if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
