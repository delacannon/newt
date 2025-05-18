import { Scene } from 'phaser'

import { TEXT_SCENE_KEY } from '../utils/constants'
import MapScene from './MapScene'
import TextScene from './TextScene'

export default class WrapperScene extends Scene {
    constructor() {
        super({
            key: 'WrapperScene',
        })
    }

    create() {
        this.scene.add('MapScene', MapScene, true)

        this.input.keyboard.on('keydown-C', this.handleKeyC.bind(this))
        this.input.keyboard.on('keyup_ESC', this.handleKeyESC.bind(this))
        this.input.keyboard.on('keydown-F1', this.handleKeyS.bind(this))
        this.input.keyboard.on('keydown-F3', this.handleKeySave.bind(this));
        this.input.keyboard.on('keydown-F4', this.handleKeyLoad.bind(this));
    }

    handleKeyC() {
        this.scene.add(TEXT_SCENE_KEY, TextScene, true)
    }

    handleKeyESC() {
        this.registry.set('dk', false)
        this.scene.remove(TEXT_SCENE_KEY)
    }

    handleKeyS() {
        const jsonData = this.createSaveData()
        const encodedData = encodeURIComponent(jsonData)
        const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`

        window.open(url, '_blank')
    }

    createSaveData() {
        const iconTiles = JSON.parse(localStorage.getItem('icons')) || []
        const textTiles = JSON.parse(localStorage.getItem('texts')) || []
        const propsTiles = JSON.parse(localStorage.getItem('props')) || []
        const gridTiles = JSON.parse(localStorage.getItem('grid')) || []

        const data = {
            icons: iconTiles,
            texts: textTiles,
            props: propsTiles,
            grid: gridTiles,
        }

        const jsonData = JSON.stringify(data)
        return jsonData
    }

    loadSaveData(evt) {
        const files = evt.target.files;
        let fr = new FileReader();
        fr.onload = function(event) {
            const jsonData = event.target.result;
            const data = JSON.parse(jsonData);
            localStorage.setItem('icons', JSON.stringify(data?.icons));
            localStorage.setItem('texts', JSON.stringify(data?.texts));
            localStorage.setItem('props', JSON.stringify(data?.props));
            localStorage.setItem('grid',  JSON.stringify(data?.grid));
            localStorage.setItem('save',  JSON.stringify(data?.save));
            const url = `${window.location.origin}${window.location.pathname}`
            window.open(url, '_blank')
        };
        fr.readAsText(files[0]);
        
    }

    handleKeySave() {
        const jsonData = this.createSaveData();
        const exportName = "AlienSave"
        localStorage.setItem("save", jsonData);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    handleKeyLoad() {
        var inputElement = document.createElement("input");
        inputElement.type = "file";
        inputElement.accept = "*.json,application/json";
        inputElement.addEventListener("change", this.loadSaveData.bind(this));
        inputElement.dispatchEvent(new MouseEvent("click"));
    }
}
