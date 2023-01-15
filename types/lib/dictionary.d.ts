export default class Dictionary {
    static use(name: string): void;

    static add(name: string, dictionary?: object): void;
    
    static translate(index: string): any;
}