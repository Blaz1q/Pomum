export class Sticker{
    constructor(props){
        const rawProps =
        typeof props.props === "function" ? props.props() : props.props;

        // 2. Gwarancja, że this.props to zawsze obiekt
        this.props = rawProps || {};
        if (props.effect) {
            this.props.effect = props.effect;
        }

        if (props.remove) {
            this.props.remove = props.remove;
        }
        this.name = props.name
        this.descriptionfn = props.descriptionfn;
        this.url = "./images/stickers/";
        this.image = () => {
            return `${this.url}${props.image ? props.image.toLowerCase() : this.name?.toLowerCase()}.png`;
        };
    }
    render(){
        const sticker = new Image();
        sticker.src = this.image();
        sticker.width=28;
        sticker.height=28;
        const randomRotation = (Math.random() * 30) - 15;
        sticker.style.transform = `rotate(${randomRotation}deg)`;
        sticker.style.filter = 'drop-shadow(0 2px 1px rgba(0,0,0,0.3))';
        return sticker;
    }
    apply(upgrade, game){
        console.log("applying:")
        console.log(upgrade);
        this.props.upgrade = upgrade;
        this.props.game = game;
        if(!this.props.effect) return;
        this.props.effect.call(this,upgrade,game);
    }
}