import itertools
import os
import random
from collections import namedtuple

from PIL import Image
import json

Point = namedtuple("Point", ['x', 'y'])
Link = namedtuple("Link", ['self', 'next', 'prev'], defaults=(None, None, None))


def get_neighbours(x, y, pixel_data):
    items = []
    for new_x, new_y in [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]:
        try:
            if new_x == -1 or new_y == -1:
                return [0]
            items.append(pixel_data[new_x, new_y][3])
        except IndexError:
            return [0]
    return items


def get_path(edge_nodes):
    def sort_items(item):
        # 812
        # 7X3
        # 654
        return {
            (0, -1): 1,
            (1, -1): 2,
            (1, 0): 3,
            (1, 1): 4,
            (0, 1): 5,
            (-1, 1): 6,
            (-1, 0): 7,
            (-1, -1): 8
        }[item]

    def get_around(node, edge_nodes):
        around = []
        for adj_x, adj_y in itertools.product(range(-1, 2), range(-1, 2)):
            if (node[0] + adj_x, node[1] + adj_y) in edge_nodes and not (adj_y == 0 and adj_x == 0):
                around.append((node[0] + adj_x, node[1] + adj_y, sort_items((adj_x, adj_y))))
        items = sorted(around, key=lambda item: item[2])
        return [Point(item[0], item[1]) for item in items]

    start_node = sorted(edge_nodes)[0]
    edge_nodes.remove(start_node)
    chain = [start_node]
    next = start_node

    while len(edge_nodes) > 0:
        if start_node in get_around(next, chain) and len(chain) > 3:
            return chain

        try:
            around = get_around(next, edge_nodes)
            next = around[0]
            edge_nodes.remove(next)
            chain.append(next)
        except IndexError as e:
            chain.pop()
            next = chain[-1]

    print(chain)
    return chain


class CustomException(Exception):
    pass


if __name__ == '__main__':
    with open("sprites.json") as f_sprites:
        sprites = json.load(f_sprites)

    try:
        os.mkdir("sprites")
    except FileExistsError:
        pass

    chains = {

    }

    for sprite_name, sprite_info in sprites['frames'].items():

        print(sprite_name, sprite_info)
        with Image.open("sprites.png") as image:
            new_img = image.crop((
                sprite_info['frame']['x'],
                sprite_info['frame']['y'],
                sprite_info['frame']['x'] + sprite_info['sourceSize']['w'],
                sprite_info['frame']['y'] + sprite_info['sourceSize']['h']
            ))

            pixel_data = new_img.load()
            edges = []

            for x, y in itertools.product(range(sprite_info['sourceSize']['w']), range(sprite_info['sourceSize']['h'])):
                if pixel_data[x, y][3] != 0:
                    if 0 in get_neighbours(x, y, pixel_data):
                        edges.append(Point(x, y))
                        # pixel_data[x, y] = (0, 0, 0, 255)
                    else:
                        pixel_data[x, y] = (255, 255, 255, 255)

            try:
                edge_path = get_path(edges)
                chains[sprite_name] = edge_path
                point = edge_path.pop(0)
                pixel_data[point.x, point.y] = (255, 0, 0, 255)
                for index, point in enumerate(edge_path):
                    pixel_data[point.x, point.y] = (index * 10 % 150, index * 10 % 150, index * 10 % 150, 255)
            except CustomException as e:
                print(e)

            # new_img.save("sprites/" + sprite_name + '.png')
    with open("sprites.json") as json_file:
        sprite_data = json.load(json_file)

        for sprite_name, sprite_bounding_chain in chains.items():
            sprite_data['frames'][sprite_name]['boundingPoints'] = sprite_bounding_chain

    json.dump(sprite_data, open("sprites.json", 'w'))
    print(sprite_data)
