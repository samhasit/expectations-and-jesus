"""Rebuild the "What the group sees" blocks in leader.html from index.html.

Run after editing index.html or script.js:

    python build-leader.py

Each flow step in leader.html carries data-group="<section id>". This script
extracts that section from index.html, strips interactive parts (buttons,
ids, data attributes, hidden flags), and writes it into a <details> block
right after the step's <dl>. Existing blocks are replaced.
"""
import io
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))


def read(name):
    return io.open(os.path.join(ROOT, name), encoding="utf-8").read()


def write(name, text):
    io.open(os.path.join(ROOT, name), "w", encoding="utf-8", newline="\n").write(text)


index = read("index.html")
script = read("script.js")
leader = read("leader.html")


def section_inner(section_id):
    m = re.search(
        r'<section[^>]*id="%s"[^>]*>(.*?)</section>' % re.escape(section_id), index, re.S
    )
    assert m, section_id
    inner = m.group(1)
    shell = re.search(r'^\s*<div class="shell">(.*)</div>\s*$', inner, re.S)
    return shell.group(1) if shell else inner


def block(inner, cls):
    """Return the first element with the given class, including its closing tag."""
    m = re.search(r'<(\w+) class="%s[^"]*"[^>]*>' % re.escape(cls), inner)
    assert m, cls
    tag = m.group(1)
    depth = 0
    pos = m.start()
    for t in re.finditer(r"<(/?)%s\b[^>]*>" % tag, inner[pos:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return inner[pos : pos + t.end()]
    raise AssertionError(cls)


def clean(html):
    html = re.sub(r"<button\b.*?</button>", "", html, flags=re.S)
    html = re.sub(r'\s+id="[^"]*"', "", html)
    html = re.sub(r'\s+data-[a-z-]+(="[^"]*")?', "", html)
    html = re.sub(r'\s+aria-pressed="[^"]*"', "", html)
    html = re.sub(r'\s+aria-live="[^"]*"', "", html)
    html = re.sub(r"<p hidden>", "<p>", html)
    html = re.sub(r"\n\s*\n", "\n", html)
    return html.strip()


def audit_content():
    m = re.search(r"const auditContent = \{(.*?)\n  \};", script, re.S)
    assert m
    out = {}
    for key, title, copy, question in re.findall(
        r'(\w+): \{\s*title: "([^"]*)",\s*copy: "([^"]*)",\s*question: "([^"]*)"', m.group(1)
    ):
        out[key] = (title, copy, question)
    assert len(out) == 5, out.keys()
    return out


def audit_static(inner):
    content = audit_content()
    items = []
    for key, num, title, small in re.findall(
        r'<button class="audit-option"[^>]*data-audit="(\w+)"[^>]*>\s*<span>(\d+)</span>\s*<strong>([^<]*)</strong>\s*<small>([^<]*)</small>',
        inner,
    ):
        t, c, q = content[key]
        items.append(
            "<article><span>%s</span><strong>%s</strong><small>%s</small>"
            '<div class="group-audit__response"><p class="group-audit__label">When tapped</p>'
            "<strong>%s</strong><p>%s</p>"
            '<p class="group-audit__question"><span>A better question</span> %s</p></div></article>'
            % (num, title, small, t, c, q)
        )
    assert len(items) == 5
    return '<div class="group-audit">%s</div>' % "".join(items)


def surrender_static(inner):
    tool = block(inner, "surrender-tool")
    head = re.search(r"<header>(.*?)</header>", tool, re.S).group(1)
    head = head.replace("<p>Tap each question. Nothing is saved or submitted.</p>", "")
    items = re.findall(
        r"<span>(\d+)</span><strong>([^<]*)</strong><small>([^<]*)</small>.*?<p hidden>([^<]*)</p>",
        tool,
        re.S,
    )
    assert len(items) == 5
    lis = "".join(
        "<li><span>%s</span><strong>%s</strong><small>%s</small><p>%s</p></li>" % i for i in items
    )
    return '<div class="surrender-tool"><header>%s</header><div class="group-surrender"><ol>%s</ol></div></div>' % (
        head.strip(),
        lis,
    )


def build(key):
    if key == "open":
        hero = re.search(r'<header class="hero"[^>]*>(.*?)</header>', index, re.S).group(1)
        body = block(hero, "hero__prompt") + block(hero, "passage-pair")
        return clean(body)
    inner = section_inner(key)
    if key == "expectation-audit":
        inner = inner.replace(block(inner, "audit-layout"), audit_static(inner))
    if key == "living-water":
        inner = inner.replace(block(inner, "surrender-tool"), surrender_static(inner))
    if key == "takeaway":
        inner = inner.replace(block(inner, "source-section"), "")
        inner = inner.replace(block(inner, "site-footer"), "")
    return clean(inner)


# Remove existing blocks, then insert fresh ones after each step's </dl>.
leader = re.sub(r'\s*<details class="group-view[^>]*>.*?</details>', "", leader, flags=re.S)

def insert(m):
    key = m.group(1)
    body = build(key)
    return (
        '%s\n            <details class="group-view group-view--%s" open>\n'
        "              <summary>What the group sees</summary>\n"
        '              <div class="group-view__body">\n%s\n              </div>\n'
        "            </details>" % (m.group(0), key, body)
    )

count = 0
def step_sub(m):
    global count
    count += 1
    return insert(m)

leader, n = re.subn(
    r'<li class="leader-step" data-start="\d+" data-end="\d+" data-group="([a-z-]+)">.*?</dl>',
    step_sub,
    leader,
    flags=re.S,
)
assert n == 8, n
write("leader.html", leader)
print("rebuilt %d group-view blocks" % n)
