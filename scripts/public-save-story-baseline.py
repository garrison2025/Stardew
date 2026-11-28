"""Independent stdlib XML reader for the pinned public fixture. Output is captured by Node, never logged."""
import json, sys, xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
def unique(parent, name, tags):
    if parent is None:
        return None
    nodes = parent.findall(name)
    if len(nodes) != 1:
        return None
    n = nodes[0]
    if n.get('{http://www.w3.org/2001/XMLSchema-instance}nil') in ('1','true'):
        return None
    if any(c.tag not in tags or len(c) or not (c.text or '').strip() for c in n):
        return None
    return sorted(set((c.text or '').strip() for c in n))
player = root.find('player')
team = root.find('team')
orders = root.findall('completedSpecialOrders') + (team.findall('completedSpecialOrders') if team is not None else [])
print(json.dumps(dict(notes=unique(player,'secretNotesSeen',{'int'}),events=unique(player,'eventsSeen',{'int','string'}),achievements=unique(player,'achievements',{'int'}),orders=unique(root,'completedSpecialOrders',{'string'}) if len(orders)==1 and root.find('completedSpecialOrders') is not None else unique(team,'completedSpecialOrders',{'string'}) if len(orders)==1 else None)))
