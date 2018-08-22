import GameComponent from "./gameComponent";


const STANCES = {
    AGGRESSIVE: "AGGRESSIVE",
    DEFENSIVE: "DEFENSIVE",
    RETREATING: "RETREATING"
};

export default class AIComponent extends GameComponent{
    constructor(parent) {
        super(parent);

        const {AGGRESSIVE, DEFENSIVE, RETREATING} = STANCES;
        this.stance = null;

        switch (parent.type.aiType) {
            case AGGRESSIVE:
                this.stance = AGGRESSIVE;
                break;
            case DEFENSIVE:
                this.stance = DEFENSIVE;
                break;
            case RETREATING:
                this.stance = RETREATING;
                break;
            default:
                throw new Error("STANCE WAS NOT DEFINED FROM TYPE! STANCE: " + parent.type.aiType);
        }

        this.aiMap = {
            AGGRESSIVE: this.aggressiveUpdate,
            DEFENSIVE: this.defensiveUpdate,
            RETREATING: this.retreatingUpdate
        };
    }

    aggressiveUpdate = () => {
        // Ramming only method c:

    };

    defensiveUpdate = () => {

    };

    retreatingUpdate = () => {

    };

    update(delta, fleets) {
        // figure out stance. (Aggressive, Defensive, Passive?, Retreating)
        // Now, dependant on stance, update state of AI.
        this.updateStance();

        // Run that states update method
        this.aiMap[this.stance]();
    }

    updateStance = () => {

    }

    toString = () => {
        return "AIComponent::ParentClassMaybe?"
    }
}