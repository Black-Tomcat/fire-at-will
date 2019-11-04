import { Application, Texture, Loader, LoaderResource, AnimatedSprite, Sprite } from "pixi.js";

export interface Asset {
    name: string;
    resourceName: string;
    load: (
        resources: Partial<Record<string, LoaderResource>>,
        loader: Loader
    ) => {
        textures: Record<string, Texture | BoundedTexture>;
        animations?: Record<string, string[]>;
    };
}

export class BoundedTexture {
    public readonly texture: Texture;
    public readonly boundingPoints: [number, number][];
    public readonly sourceSize: { w: number; h: number };

    constructor(texture: Texture, boundingPoints: [number, number][], sourceSize: { w: number; h: number }) {
        this.texture = texture;
        this.boundingPoints = boundingPoints;
        this.sourceSize = sourceSize;
    }
}

export default class RenderCore {
    public app: Application;
    public readonly textures: Record<string, Texture | BoundedTexture>;
    public readonly animations: Record<string, Texture[]>;

    constructor() {
        this.app = new Application({
            width: window.innerWidth,
            height: window.innerHeight
        });

        this.renderer.autoResize = true;
        window.addEventListener("resize", () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display = "block";

        this.textures = {};
        this.animations = {};
    }

    public get loader() {
        return this.app.loader;
    }

    public get renderer() {
        return this.app.renderer;
    }

    public get stage() {
        return this.app.stage;
    }

    public get view() {
        return this.app.view;
    }

    async initialize(assets: Asset[]) {
        for (const asset of assets) {
            this.loader.add(asset.name, asset.resourceName);
        }

        const load = new Promise(accept => {
            this.loader.load((loader: Loader, resources: Partial<Record<string, LoaderResource>>) => {
                for (const asset of assets) {
                    const nextItems = asset.load(resources, loader);

                    console.log(asset.name, nextItems);
                    Object.assign(this.textures, nextItems.textures);
                    Object.assign(this.animations, nextItems.animations);
                }

                document.body.appendChild(this.view);
                accept();
            });
        });

        await load;
    }

    public createNewSprite(textureName: string): Sprite {
        if (this.textures[textureName] instanceof BoundedTexture) {
            return new Sprite((this.textures[textureName] as BoundedTexture).texture);
        } else {
            return new Sprite(this.textures[textureName] as Texture);
        }
    }

    public createNewAnimatedSprite(textureName: string): AnimatedSprite {
        return new AnimatedSprite(this.animations[textureName]);
    }
}
