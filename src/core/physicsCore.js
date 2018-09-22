export default class PhysicsCore {
    static GRIDSIZE = 100;

    constructor(gameCore) {
        this.gameCore = gameCore;

        this.bulletsGrid = {

        };

        this.objectsGrid = {

        };
    }

    detectCollisions = () => {
        for (let cell in this.objectsGrid) {
            for (let object of this.objectsGrid[cell]) {
                if (this.bulletsGrid[cell] === undefined) break;

                for (let bullet of this.bulletsGrid[cell]) {
                    // TODO resolve collisions
                }
            }
        }
    };

    removeObject = () => {

    };

    moveObject = () => {
        // TODO dummy commit
    };


    addObject = (object) => {
        const gridNum = this.calculateGridNum(object.parent.pos);

        if (object.toString().split("::")[0] === "bullet") {
            if (!this.bulletsGrid[gridNum]?.push(object) ) {
                this.bulletsGrid[gridNum] = [object]
            }
        } else {
            if (!this.objectsGrid[gridNum]?.push(object) ) {
                this.objectsGrid[gridNum] = [object]
            }
        }
    };

    calculateGridNum = (pos) => {
          return (Math.floor(pos.x / 100) * 100) + ", " + (Math.floor(pos.y / 100) * 100)
    };
}