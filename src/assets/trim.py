import json

if __name__ == '__main__':
    with open("sprites.json") as f_sprites:
        sprites = json.load(f_sprites)

    for sprite_name, sprite_info in sprites['frames'].items():
        bounding_points = sprite_info['boundingPoints']

        new_bounding = []
        for index in range(len(bounding_points)):
            if index == 0 or index == (len(bounding_points) - 1):
                new_bounding.append(bounding_points[index])
                continue

            if (
                (
                    bounding_points[index - 1][0] == bounding_points[index][0] and
                    bounding_points[index + 1][0] == bounding_points[index][0]
                ) or (
                    bounding_points[index - 1][1] == bounding_points[index][1] and
                    bounding_points[index + 1][1] == bounding_points[index][1]
                )
            ):
                continue
            else:
                new_bounding.append(bounding_points[index])

        sprites['frames'][sprite_name]['boundingPoints'] = new_bounding

    json.dump(sprites, open("sprites.json", 'w'))
