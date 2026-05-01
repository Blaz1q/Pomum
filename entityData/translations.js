import { Style,LANGUAGE } from "../dictionary.js";

export const translations = {
    [LANGUAGE.PL]: {
        upgrades: {
            battlepass:{
                name: "Battlepass",
                description: (up) => `Na końcu rundy to ulepszenie dostaje ${Style.Mult("+1 mult")}. (Obecnie ${Style.Mult("+" + up.props.mult + " mult")})`
            },
            highfive:{
                name: "High Five",
                description: `Gdy zniszczy się ${Style.Highlight('pięć')} kafelków w linii, ${Style.Mult("X2 mult")}`
            },
            broke:{
                name: "Broke",
                description: `Jeżeli ma się mniej niż ${Style.Money('$6')}, ${Style.Score("+250 punktów")}`
            },
            robber: {
                name: "Robber",
                description: (up) => `Daje ${Style.Mult('mult')} za ${Style.Highlight('cenę sprzedaży')} wszystkich kupionych ulepszeń. (Obecnie ${Style.Mult(`+${up.props.calcMult()} mult`)}).`
            }
        }
    },
    [LANGUAGE.EN]: {
        upgrades: {
            battlepass:{
                name: "Battlepass",
                description: (up) => `At the end of round this upgrade gets ${Style.Mult("+1 mult")}. (Currently ${Style.Mult("+" + (up.props.mult ?? 3) + " mult")})`
            },
            highfive:{
                name: "High Five",
                description: `Upon destroying ${Style.Highlight('five')} tiles in a line, ${Style.Mult("X2 mult")}`
            },
            broke:{
                name: "Broke",
                description: `If you have less than ${Style.Money('$6')}, ${Style.Score("+250 points")}`
            },
            robber: {
                name: "Robber",
                description: (up) => `Gives ${Style.Mult('mult')} for ${Style.Highlight('sell price')} of all owned upgrades. (Currently ${Style.Mult(`+${up.props.calcMult()} mult`)}).`
            }
        }
    }
}