import GameComponent from "../components/gameComponent";
import gameObject, {ObjectName} from "./gameObject";
import GameCore from "../core/gameCore";
import Spaceship from "./spaceship";


export default class Fleet extends gameObject{
    private player: boolean;
    public readonly spaceships: Spaceship[];

    constructor(
        gameCore: GameCore,
        player=false
    ) {
        super(gameCore, "Fleet");
        this.player = player;

        this.spaceships = []
    }

    addNewSpaceship = (spaceship: Spaceship) => {
        this.spaceships.push(spaceship);
    };

    toString() {
        return 'fleet';
    }

    get components(): GameComponent[] {
        return [];
    }

    cleanUp(gameCore: GameCore): void {}
}