import {intersection} from "greiner-hormann"
import _ from "lodash";

import {PhysicsComponent, XYObj} from "components";
import GameObject, {Bullet, Spaceship} from 'objects';

export default class PhysicsCore {
    static GRIDSIZE = 100;
    private cos: ((x: number) => number);
    private sin: ((x: number) => number);
    constructor() {
        this.cos = _.memoize(Math.cos);
        this.sin = _.memoize(Math.sin);
    }


    translate(pos: XYObj, rotation: number, size: {w: number, h: number}, boundingBox: [number, number][]): [number, number][] {
        let rads = Math.round(((rotation + 90) / 180 * Math.PI) % (2 * Math.PI) * 10) / 10;
        return boundingBox.map((item) => [
            ((item[0] - size.w / 2) * Math.cos(rads) - (item[1] - size.h / 2) * Math.sin(rads)) + pos.x,
            ((item[1] - size.h / 2) * Math.cos(rads) + (item[0] - size.w / 2) * Math.sin(rads)) + pos.y
        ]);
    }

    inBox(pos: XYObj, anchor: XYObj, size: number = 64): boolean {
        return pos.x > anchor.x - size
            && pos.x < anchor.x + size
            && pos.y > anchor.y - size
            && pos.y < anchor.y + size;
    }

    detectCollisions = (largeObjects: PhysicsComponent[], smallObjects: PhysicsComponent[]): GameObject[] => {

        const toDelete: GameObject[] = [];


        for (const largeObject of largeObjects) {
            const bullets = smallObjects.filter(
                (bulletPhysics: PhysicsComponent) => bulletPhysics.parent.pos.x
            );

            if (bullets.length == 0) {
                continue
            }

            const largeTranslation = this.translate(
                largeObject.parent.pos,
                largeObject.parent.rotation,
                largeObject.size,
                largeObject.boundingBox
            );

            for (const bulletPhysics of bullets) {
                let bullet = bulletPhysics.parent;
                let pos = bullet.pos;
                if (pos.x < 0 || pos.y < 0 || pos.x > 1000 || pos.y > 1000) {
                    toDelete.push(bullet);
                    continue;
                }

                if ((bullet as Bullet).spawner === (largeObject.parent as Spaceship)) {
                    continue;
                }

                if (intersection(
                    this.translate(pos, bullet.rotation, {w: 2, h: 3}, bulletPhysics.boundingBox),
                    largeTranslation
                ) != null) {
                    toDelete.push(bullet)
                }
            }
        }

        return toDelete
    };
}
