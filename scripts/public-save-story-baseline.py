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
locations = root.findall('locations/GameLocation')

def location(name):
    matches = [node for node in locations if node.findtext('name') == name]
    return matches[0] if len(matches) == 1 else None

def dictionary(parent, name, key_path, positive_path=None):
    node = parent.find(name) if parent is not None else None
    if node is None or node.get('{http://www.w3.org/2001/XMLSchema-instance}nil') in ('1', 'true'):
        return None
    ids = set()
    for entry in node:
        key = entry.findtext(key_path + '/string') or entry.findtext(key_path + '/int')
        if entry.tag != 'item' or not key:
            return None
        if positive_path is not None:
            quantity = entry.findtext(positive_path)
            if quantity is None or not quantity.isdecimal():
                return None
            if int(quantity) == 0:
                continue
        ids.add(key.removeprefix('(O)'))
    return sorted(ids)

center = location('CommunityCenter')
definitions = root.find('bundleData')
bundle_donations = {}
if center is not None and definitions is not None:
    defined_ids = {node.rsplit('/', 1)[-1] for entry in definitions.findall('item')
                   if (node := entry.findtext('key/string'))}
    for entry in center.findall('bundles/item'):
        bundle_id = entry.findtext('key/int')
        if bundle_id in defined_ids:
            bundle_donations[bundle_id] = [i for i, flag in enumerate(entry.findall('value/ArrayOfBoolean/boolean'))
                                           if flag.text == 'true']

print(json.dumps(dict(shipping=dictionary(player, 'basicShipped', 'key', 'value/int'),
                     museum=dictionary(location('ArchaeologyHouse'), 'museumPieces', 'value'),
                     bundle_donations=bundle_donations, notes=unique(player,'secretNotesSeen',{'int'}),events=unique(player,'eventsSeen',{'int','string'}),achievements=unique(player,'achievements',{'int'}),orders=unique(root,'completedSpecialOrders',{'string'}) if len(orders)==1 and root.find('completedSpecialOrders') is not None else unique(team,'completedSpecialOrders',{'string'}) if len(orders)==1 else None)))
