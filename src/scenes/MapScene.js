import Phaser, { Actions, Geom, Scene } from 'phaser'

import jsPDF from 'jspdf'
import { Ids, Patterns } from 'phaser3-autotile'
import { Grid, Pipeline, Tiles } from '../utils'
import { EDITOR_TEXTS, TEXT_SCENE_KEY } from '../utils/constants'
import TextEditor from './TextEditor'

const EDITABLE_AREA = {
    X: 850,
    Y: 32,
}

const GRID_OFFSET = {
    X: 24,
    Y: 30,
}

export default class MapScene extends Scene {
    constructor() {
        super({ key: 'MapScene' })
    }

    storeRGBValues() {
        const rgbValues = {
            R: this.R,
            G: this.G,
            B: this.B,
        }
        localStorage.setItem('rgbValues', JSON.stringify(rgbValues))
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search)
        const encodedData = urlParams.get('data')

        if (encodedData) {
            try {
                const data = JSON.parse(decodeURIComponent(encodedData))

                if (data.icons)
                    localStorage.setItem('icons', JSON.stringify(data?.icons))
                if (data.texts)
                    localStorage.setItem('texts', JSON.stringify(data?.texts))
                if (data.props)
                    localStorage.setItem('props', JSON.stringify(data?.props))
                if (data.grid)
                    localStorage.setItem('grid', JSON.stringify(data?.grid))
                if (data.rgbValues)
                    localStorage.setItem(
                        'rgbValues',
                        JSON.stringify(data?.rgbValues)
                    )
            } catch (error) {
                console.error('Failed to decode data from URL:', error)
            }
        }

        this.iconTiles = JSON.parse(localStorage.getItem('icons')) || []
        this.textTiles = JSON.parse(localStorage.getItem('texts')) || []
        this.propsTiles = JSON.parse(localStorage.getItem('props')) || []
        this.gridTiles = JSON.parse(localStorage.getItem('grid')) || []
        this.rgbValues = JSON.parse(localStorage.getItem('rgbValues')) || {
            R: 0.0,
            G: 0.0,
            B: 0.0,
        }
    }

    preload() {
        this.customPipeline = this.game.renderer.addPipeline(
            'Custom',
            new Pipeline(this.game)
        )
        this.customPipeline.setFloat2(
            'resolution',
            this.game.config.width,
            this.game.config.height
        )
        this.customPipeline.setFloat2('mouse', 0.0, 0.0)
    }

    generateTiles() {
        const arr = Array.from({ length: 128 }, (_, i) => i)
        this.group = this.add.group({
            key: 'props',
            frame: arr,
            frameQuantity: 1,
        })

        this.group.getChildren().forEach((prop) => {
            prop.setInteractive()
                .on('pointerdown', () => this.selectTile(prop))
                .on('pointerover', () => prop.setTint(0x888888))
                .on(
                    'pointerout',
                    () => !prop.selected && prop.setTint(0xffffff)
                )
        })

        Actions.GridAlign(this.group.getChildren(), {
            width: 20,
            height: 4,
            cellWidth: 38,
            cellHeight: 38,
            x: 52,
            y: 330,
        })
    }

    selectTile(prop) {
        prop.selected = true
        this.selectedTile = prop.frame.name
        prop.setTint(0x888888)
    }

    generateIcons() {
        const iconGroup = this.add.group()

        Tiles.forEach((tile) => {
            const icon = this.createIcon(tile)
            iconGroup.add(icon)
        })

        Actions.GridAlign(iconGroup.getChildren(), {
            width: 20,
            height: 4,
            cellWidth: 38,
            cellHeight: 38,
            x: 32,
            y: 200,
        })

        iconGroup.getChildren().forEach((icon) => {
            icon.setInteractive()

            icon.on('pointerover', () => {
                this.icon_selected_name = icon.name
            })
            icon.on('pointerout', () => {
                this.icon_selected_name = ''
            })
        })
    }

    createIcon(tile) {
        const icon = this.add
            .image(0, 0, tile.icon)
            .setScale(0.5)
            .setInteractive()
        icon.name = tile.name
        icon.tileName = tile.icon
        icon.selected = false

        icon.on('pointerover', () => {
            this.iconSelectedName = `- ${icon.name.toUpperCase()}`
        })

        icon.on('pointerdown', () => {
            this.handleIconSelection(icon)
        })

        return icon
    }

    handleIconSelection(icon) {
        this.saveState()
        this.clearSelections(icon)
        icon.selected = true
        this.beep.play()
        this.iconSelectedName = `- ${icon.name.toUpperCase()}`

        const draggableIcon = this.createDraggableIcon(icon)
        this.iconTilesGroup.add(draggableIcon)
    }

    clearSelections(selectedIcon) {
        this.iconGroup?.getChildren().forEach((icon) => {
            icon.selected = false
            icon.setAlpha(icon === selectedIcon ? 0.5 : 1)
        })
    }

    createDraggableIcon(icon) {
        const draggableIcon = this.add
            .image(EDITABLE_AREA.X + 32, EDITABLE_AREA.Y + 32, icon.tileName)
            .setScale(0.5)
            .setInteractive()

        this.input.setDraggable(draggableIcon)
        draggableIcon.name = this.iconTiles.length
        this.iconTiles.push(draggableIcon)
        localStorage.setItem('icons', JSON.stringify(this.iconTiles))

        draggableIcon.on('pointerup', () => {
            this.iconTiles[draggableIcon.name] = draggableIcon
            localStorage.setItem('icons', JSON.stringify(this.iconTiles))
        })

        draggableIcon.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                draggableIcon.destroy()
                this.iconTiles.splice(draggableIcon.name, 1)
                localStorage.setItem('icons', JSON.stringify(this.iconTiles))
            }
        })

        return draggableIcon
    }

    saveState() {
        const state = {
            iconTiles: JSON.parse(JSON.stringify(this.iconTiles)),
            textTiles: JSON.parse(JSON.stringify(this.textTiles)),
            propsTiles: JSON.parse(JSON.stringify(this.propsTiles)),
            gridTiles: JSON.parse(JSON.stringify([...this.grid.grid])),
        }
        this.undoStack.push(state)
        this.redoStack = []
    }

    restoreState(state) {
        this.iconTiles = JSON.parse(JSON.stringify(state.iconTiles))
        this.textTiles = JSON.parse(JSON.stringify(state.textTiles))
        this.propsTiles = JSON.parse(JSON.stringify(state.propsTiles))
        this.grid.grid = new Map(state.gridTiles)

        this.iconTilesGroup.clear(true, true)
        this.textTilesGroup.clear(true, true)
        this.populateIconTilesGroup()
        this.populateTextTilesGroup()
        this.drawUI()
        this.update()
    }

    undo() {
        if (this.undoStack.length > 0) {
            const currentState = {
                iconTiles: JSON.parse(JSON.stringify(this.iconTiles)),
                textTiles: JSON.parse(JSON.stringify(this.textTiles)),
                propsTiles: JSON.parse(JSON.stringify(this.propsTiles)),
                gridTiles: JSON.parse(JSON.stringify([...this.grid.grid])),
            }
            this.redoStack.push(currentState)
            const prevState = this.undoStack.pop()
            this.restoreState(prevState)
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const currentState = {
                iconTiles: JSON.parse(JSON.stringify(this.iconTiles)),
                textTiles: JSON.parse(JSON.stringify(this.textTiles)),
                propsTiles: JSON.parse(JSON.stringify(this.propsTiles)),
                gridTiles: JSON.parse(JSON.stringify([...this.grid.grid])),
            }
            this.undoStack.push(currentState)
            const nextState = this.redoStack.pop()
            this.restoreState(nextState)
        }
    }

    create() {
        this.undoStack = []
        this.redoStack = []

        this.textgroup = this.add.group()
        this.cameras.main.fadeIn(1000)
        this.beep = this.sound.add('beep', { volume: 0.25 })
        this.selectedTile = 0
        this.registry.events.on('changedata', this.updateData, this)
        this.time = 0.0
        this.brigt = 0.6
        this.noise = 0.0
        this.R = this.rgbValues.R
        this.B = this.rgbValues.B
        this.icon_selected_name = ''
        this.cameras.main.setRenderToTexture(this.customPipeline)
        this.drawTexts()
        this.input.mouse.disableContextMenu()
        this.drawing = true
        this.disableKeyboard = false
        this.drawingTiles = false
        this.mirror = {
            x: false,
            y: false,
            xy: false,
        }
        this.tileSize = 32
        this.cursor = new Geom.Rectangle(0, 0, 1, 1)
        this.board = {
            x: EDITABLE_AREA.X,
            y: EDITABLE_AREA.Y,
        }
        this.grid = new Grid(0, 0, 25, 31, this.gridTiles)
        this.propsGrid = new Grid(0, 0, 25, 31, this.gridTiles)
        this.graphics = this.add.graphics()
        this.spriteKey = ['blob', 'round']
        this.currentTiles = 0
        this.mapLayer = true
        this.generateIcons()
        this.generateTiles()

        this.killScene = false
        this.hud = this.sound.add('hud', { volume: 0.3 })

        const drawRect = new Geom.Rectangle(
            EDITABLE_AREA.X,
            EDITABLE_AREA.Y,
            this.grid.pointwise.width * this.tileSize + 1,
            this.grid.pointwise.height * this.tileSize + 1
        )

        this.text_help = false
        this.setupKeyboard()
        this.setupBackground(drawRect)
        this.setupTilemaps()
        this.setupDragEvents()

        this.iconTilesGroup = this.add.group()
        this.populateIconTilesGroup()

        this.textTilesGroup = this.add.group()
        this.populateTextTilesGroup()

        this.drawUI()
    }

    setupKeyboard() {
        this.input.keyboard.on('keydown_H', this.toggleHelp, this)
        this.input.keyboard.on('keydown_ESC', this.resetMap, this)
        this.input.keyboard.on('keydown_A', this.adjustBrightness, this)
        this.input.keyboard.on('keydown_N', this.toggleNoise, this)
        this.input.keyboard.on('keydown_X', this.toggleMirrorX, this)
        this.input.keyboard.on('keydown_Y', this.toggleMirrorY, this)
        this.input.keyboard.on('keydown_SPACE', this.switchLayer, this)
        this.input.keyboard.on('keydown_R', this.adjustRed, this)
        this.input.keyboard.on('keydown_B', this.adjustBlue, this)
        this.input.keyboard.on('keydown_I', this.downloadAsPNG, this)
        this.input.keyboard.on('keydown_P', this.printAsPDF, this)
        this.input.keyboard.on('keydown_F2', this.generateRandomMap, this)
        this.input.keyboard.on('keydown_Z', this.undo, this)
        this.input.keyboard.on('keydown_V', this.redo, this)
    }

    setupBackground(rect) {
        const bg = this.add.graphics()
        bg.setDefaultStyles({
            fillStyle: {
                color: 0x27403f,
                alpha: 0.5,
            },
        })
        bg.fillRectShape(rect)
    }

    setupTilemaps() {
        this.textures.generateBlobAutotileTexture(this.spriteKey[0], {
            subtileGeometry: {
                tileWidth: this.tileSize,
            },
        })

        this.textures.generateBlobAutotileTexture(this.spriteKey[1], {
            subtileGeometry: {
                tileWidth: this.tileSize,
            },
        })

        const { pointwise } = this.grid

        this.autotileMapLayer = this.add.tilemap(
            null,
            this.tileSize,
            this.tileSize,
            pointwise.width,
            pointwise.height
        )

        this.autotilePropsLayer = this.add.tilemap(
            null,
            this.tileSize,
            this.tileSize,
            this.propsGrid.pointwise.width,
            this.propsGrid.pointwise.height
        )

        this.autotileMapLayer.addTilesetImage(this.spriteKey[0])
        this.autotilePropsLayer.addTilesetImage('props')

        this.bottomLayer = this.autotileMapLayer.createBlankDynamicLayer(
            'bottomLayer',
            this.spriteKey[0],
            this.board.x,
            this.board.y
        )
        this.upperLayer = this.autotilePropsLayer.createBlankDynamicLayer(
            'middleLayer',
            'props',
            this.board.x,
            this.board.y
        )

        this.propsTiles.forEach((tile) => {
            this.upperLayer.putTileAt(tile.t, tile.x, tile.y)
        })
    }

    setupDragEvents() {
        this.input.on('dragstart', this.onDragStart, this)
        this.input.on('drag', this.onDrag, this)
        this.input.on('dragend', this.onDragEnd, this)
        this.input.on('pointermove', this.onPointerMove, this)
    }

    populateIconTilesGroup() {
        this.iconTiles.forEach((iconTile, i) => {
            const icon = this.add
                .image(iconTile.x, iconTile.y, iconTile.textureKey)
                .setScale(0.5)
                .setInteractive()
            icon.name = iconTile.name

            icon.on('pointerup', () => {
                this.iconTiles[icon.name] = icon

                localStorage.setItem('icons', JSON.stringify(this.iconTiles))
            })

            icon.on('pointerdown', (pointer) => {
                this.saveState()
                if (pointer.rightButtonDown()) {
                    icon.destroy()
                    this.iconTiles.splice(icon.name, 1)
                    localStorage.setItem(
                        'icons',
                        JSON.stringify(this.iconTiles)
                    )
                }
            })

            this.input.setDraggable(icon)
            this.iconTilesGroup.add(icon)
        })
    }

    populateTextTilesGroup() {
        this.textTiles.forEach((textTile, i) => {
            const txt = this.add
                .bitmapText(
                    textTile.x,
                    textTile.y,
                    textTile.data.font,
                    textTile.data.text.toUpperCase(),
                    textTile.data.fontSize
                )
                .setInteractive()
                .setScale(textTile.scale.x, textTile.scale.y)
                .setAlpha(textTile.alpha || 1)

            this.input.setDraggable(txt)
            txt.name = textTile.name

            txt.on('pointerup', () => {
                this.textTiles[txt.name] = txt
                localStorage.setItem('texts', JSON.stringify(this.textTiles))
            })

            txt.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    txt.destroy()
                    this.textsTiles?.splice(txt.name, 1)
                    localStorage.setItem(
                        'texts',
                        JSON.stringify(this.textsTiles)
                    )
                } else {
                    if (this.scene.isActive('editor')) {
                        this.scene.remove('editor')
                    }
                    this.scene.add('editor', TextEditor, true, { txt })
                }
            })

            this.textTilesGroup.add(txt)
        })
    }

    toggleHelp() {
        if (this.disableKeyboard) return
        this.text_help = !this.text_help
    }

    resetMap() {
        if (this.scene.manager.isActive(TEXT_SCENE_KEY)) return
        console.log('m')
        this.saveState()
        this.propsTiles.forEach((tile) => {
            this.upperLayer.removeTileAt(tile.x, tile.y)
        })

        this.iconTiles = []
        this.textTiles = []
        this.propsTiles = []
        this.R = 0.0
        this.B = 0.0
        this.iconTilesGroup.clear(true, true)
        this.textTilesGroup.clear(true, true)
        this.grid.grid = new Map()
        localStorage.clear()
        window.history.pushState({}, document.title, '/')
    }

    generateRandomMap() {
        this.saveState()
        this.resetMap()
        this.mirror = { x: true, y: true }
        this.generateRandomDungeon()
        localStorage.setItem('grid', JSON.stringify([...this.grid.grid]))
    }

    generateRandomDungeon() {
        const roomCount = 32
        const minRoomSize = 2
        const maxRoomSize = 8

        const rooms = []

        for (let i = 0; i < roomCount; i++) {
            const roomWidth = Phaser.Math.Between(minRoomSize, maxRoomSize)
            const roomHeight = Phaser.Math.Between(minRoomSize, maxRoomSize)
            const roomX = Phaser.Math.Between(
                1,
                Math.floor(this.grid.pointwise.width / 2) - roomWidth - 1
            )
            const roomY = Phaser.Math.Between(
                1,
                Math.floor(this.grid.pointwise.height / 2) - roomHeight - 1
            )

            const newRoom = new Geom.Rectangle(
                roomX,
                roomY,
                roomWidth,
                roomHeight
            )

            let overlapping = false
            for (const room of rooms) {
                if (Geom.Intersects.RectangleToRectangle(newRoom, room)) {
                    overlapping = true
                    break
                }
            }

            if (!overlapping) {
                this.createRoom(newRoom)
                this.applyRoomMirroring(newRoom)
                rooms.push(newRoom)
            }
        }

        for (let i = 1; i < rooms.length; i++) {
            const prevRoom = rooms[i - 1]
            const newRoom = rooms[i]

            const prevCenter = this.getRoomCenter(prevRoom)
            const newCenter = this.getRoomCenter(newRoom)

            if (Phaser.Math.Between(0, 1) === 1) {
                this.createHTunnel(prevCenter.x, newCenter.x, prevCenter.y)
                this.createVTunnel(prevCenter.y, newCenter.y, newCenter.x)
            } else {
                this.createVTunnel(prevCenter.y, newCenter.y, prevCenter.x)
                this.createHTunnel(prevCenter.x, newCenter.x, newCenter.y)
            }
        }
    }

    getRoomCenter(room) {
        return {
            x: room.x + Math.floor(room.width / 2),
            y: room.y + Math.floor(room.height / 2),
        }
    }

    createRoom(room) {
        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                this.placeTileInGrid(x, y)
            }
        }
    }

    applyRoomMirroring(room) {
        if (this.mirror.x) {
            const mirroredRoomX = GRID_OFFSET.X - room.x - room.width
            this.createRoom(
                new Geom.Rectangle(
                    mirroredRoomX,
                    room.y,
                    room.width,
                    room.height
                )
            )
        }

        if (this.mirror.y) {
            const mirroredRoomY = GRID_OFFSET.Y - room.y - room.height
            this.createRoom(
                new Geom.Rectangle(
                    room.x,
                    mirroredRoomY,
                    room.width,
                    room.height
                )
            )
        }

        if (this.mirror.x && this.mirror.y) {
            const mirroredRoomX = GRID_OFFSET.X - room.x - room.width
            const mirroredRoomY = GRID_OFFSET.Y - room.y - room.height
            this.createRoom(
                new Geom.Rectangle(
                    mirroredRoomX,
                    mirroredRoomY,
                    room.width,
                    room.height
                )
            )
        }
    }

    createHTunnel(x1, x2, y) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            this.placeTileInGrid(x, y)
        }
        this.applyHTunnelMirroring(x1, x2, y)
    }

    createVTunnel(y1, y2, x) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            this.placeTileInGrid(x, y)
        }
        this.applyVTunnelMirroring(y1, y2, x)
    }

    applyHTunnelMirroring(x1, x2, y) {
        if (this.mirror.x) {
            const mirroredY = GRID_OFFSET.X - y
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                this.placeTileInGrid(x, mirroredY)
            }
        }

        if (this.mirror.y) {
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                const mirroredX = GRID_OFFSET.X - x
                this.placeTileInGrid(mirroredX, y)
            }
        }

        if (this.mirror.x && this.mirror.y) {
            const mirroredY = GRID_OFFSET.X - y
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                const mirroredX = GRID_OFFSET.X - x
                this.placeTileInGrid(mirroredX, mirroredY)
            }
        }
    }

    applyVTunnelMirroring(y1, y2, x) {
        if (this.mirror.x) {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                const mirroredY = GRID_OFFSET.Y - y
                this.placeTileInGrid(x, mirroredY)
            }
        }

        if (this.mirror.y) {
            const mirroredX = GRID_OFFSET.X - x
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                this.placeTileInGrid(mirroredX, y)
            }
        }

        if (this.mirror.x && this.mirror.y) {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                const mirroredX = GRID_OFFSET.X - x
                const mirroredY = GRID_OFFSET.Y - y
                this.placeTileInGrid(mirroredX, mirroredY)
            }
        }
    }

    placeTileInGrid(x, y) {
        this.grid.set(x, y)
        const tileId =
            Patterns.LITERAL_BLOB[
                Ids.Blob.wangId(this.grid.isSetCallback, x, y)
            ]
        this.bottomLayer.putTileAt(tileId, x, y)
    }

    adjustBrightness() {
        if (this.disableKeyboard || this.noise === 0.0) return
        this.brigt = this.brigt > 1.0 ? 0.0 : this.brigt + 0.05
    }

    toggleNoise() {
        if (this.disableKeyboard) return
        this.noise = this.noise === 0.1 ? 0.0 : 0.1
    }

    toggleMirrorX() {
        if (this.disableKeyboard) return
        this.mirror.x = !this.mirror.x
    }

    toggleMirrorY() {
        if (this.disableKeyboard) return
        this.mirror.y = !this.mirror.y
    }

    switchLayer() {
        if (this.disableKeyboard) return
        this.mapLayer = !this.mapLayer
        this.hud.play()
    }

    adjustRed() {
        if (this.disableKeyboard) return
        this.R = this.R > 0.5 ? 0.0 : this.R + 0.01
        this.storeRGBValues()
    }

    adjustBlue() {
        this.B = this.B > 0.5 ? 0.0 : this.B + 0.01
        this.storeRGBValues()
    }

    downloadAsPNG() {
        if (this.disableKeyboard) return
        this.game.renderer.snapshotArea(
            EDITABLE_AREA.X - 8,
            EDITABLE_AREA.Y - 8,
            this.grid.pointwise.width * this.tileSize + 16,
            this.grid.pointwise.height * this.tileSize + 16,
            (img) => {
                const link = document.createElement('a')
                link.href = img.src
                link.download = 'AlienImageMap.png'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            },
            'image/png'
        )
    }

    printAsPDF() {
        if (this.disableKeyboard) return
        this.game.renderer.snapshotArea(
            EDITABLE_AREA.X - 8,
            EDITABLE_AREA.Y - 8,
            this.grid.pointwise.width * this.tileSize + 16,
            this.grid.pointwise.height * this.tileSize + 16,
            (img) => {
                const doc = new jsPDF()
                const w = doc.internal.pageSize.getWidth()
                const h = doc.internal.pageSize.getHeight()
                doc.setFillColor(8, 8, 8)
                doc.rect(0, 0, w, h, 'F')
                doc.addImage(img, 'PNG', 8, 32, 195, 240)
                doc.save('AlienMap.pdf')
            },
            'image/png'
        )
    }

    onDragStart(_, gameObject) {
        const isTextOrImage =
            gameObject.type === 'BitmapText' || gameObject.type === 'Image'
        this.drawing = !isTextOrImage
        this.updating = !isTextOrImage
    }

    onDrag(_, gameObject, dragX, dragY) {
        if (['BitmapText', 'Image'].includes(gameObject.type)) {
            Object.assign(gameObject, { x: dragX, y: dragY })
        }
    }

    onDragEnd(_, gameObject) {
        if (['BitmapText', 'Image'].includes(gameObject.type)) {
            this.drawing = this.updating = true
        }
    }

    onPointerMove(pointer) {
        if (pointer.x > EDITABLE_AREA.X) {
            ;[this.cursor.x, this.cursor.y] = this.grid.pointwise.adjust(
                Math.floor(pointer.x / this.tileSize) - 1,
                Math.floor(pointer.y / this.tileSize) - 1
            )
            this.updating = true
        }
    }

    updateData(_, key, data) {
        if (key === 'dk') {
            this.disableKeyboard = data
        } else if (key === 'titles' && data !== '') {
            const txt = this.add
                .bitmapText(950, 100, 'neuro', data.toUpperCase(), 16)
                .setInteractive()
            this.input.setDraggable(txt)

            txt.name = this.textTiles.length
            this.textTiles.push(txt)
            localStorage.setItem('texts', JSON.stringify(this.textTiles))

            txt.on('pointerup', () => {
                this.textTiles[txt.name] = txt
                localStorage.setItem('texts', JSON.stringify(this.textTiles))
            })

            txt.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    txt.destroy()
                } else {
                    if (this.scene.isActive('editor')) {
                        this.scene.remove('editor')
                    }
                    this.scene.add('editor', TextEditor, true, { txt })
                }
            })
        }
    }

    drawTexts() {
        EDITOR_TEXTS.forEach((config) => {
            const text = this.add
                .bitmapText(
                    config.x,
                    config.y,
                    config.font,
                    config.text,
                    config.size
                )
                .setTint(config.tint)
                .setAlpha(config.alpha)
            if (config.rotation) text.setRotation(config.rotation)
            if (config.interactive) {
                text.setInteractive({ cursor: 'pointer' }).on('pointerup', () =>
                    window.open(config.url, '_blank')
                )
            }

            this[config.key] = text
        })
    }

    updateTexts() {
        this.text_xpos.text = `POS [X:${this.cursor.x},Y:${this.cursor.y}]`
        this.text_instructions.text = this.text_help
            ? 'DRAW MAP: left mouse button.\nERASE MAP: right mouse button.\nICONS and TEXTS can be dragged around the map.\nRight mouse button to delete ICONS and TEXTS.\nPROPS: Press SPACE to switch to the props layer.\nKEYS B and R: Change Screen Colors'
            : ''
        this.text_state.text = this.drawing ? '>>DRAWING TOOL' : '>>ICON TOOL'
        this.text_state.tint = this.drawing ? 0x1d8d80 : 0xf0f0f0
        this.text_traking.text = `[A] ADJUST SCREEN BRIGHTNESS ${Math.round(
            this.brigt * -100
        )}`
        this.text_traking.alpha = this.noise === 0.0 ? 0.25 : 1
        this.text_screen_noise.text = `[N] ${
            this.noise <= 0 ? `ENABLE` : `DISABLE`
        } SCREEN NOISE`
        this.text_icons1.text = `//MAIN ICONS ${this.icon_selected_name}`

        this.text_mirror.text =
            this.mirror.x && this.mirror.y
                ? '>>SYMMETRY [X] && [Y] ENABLED'
                : this.mirror.x
                  ? '>>SYMMETRY [X] ENABLED'
                  : this.mirror.y
                    ? '>>SYMMETRY [Y] ENABLED'
                    : 'SYMMETRY DISABLED'
        this.text_mirror.alpha = this.mirror.x || this.mirror.y ? 1 : 0.5
        this.text_mirror.tint = 0xf0f0f0

        this.text_switch_layer_ctr.text = this.mapLayer
            ? '>>MAP LAYER ENABLED'
            : '>>PROPS LAYER ENABLED'
        this.text_switch_layer_ctr.tint = this.mapLayer ? 0x1d8d80 : 0xf0f0f0
        this.text_switch_layer_ctr.alpha = 1
    }

    drawUI() {
        this.grid.pointwise.forEach((x, y) => {
            const wid = Ids.Blob.wangId(this.grid.isSetCallback, x, y)
            if (wid == null) {
                this.bottomLayer.removeTileAt(x, y)
                return
            }
            const tileId = Patterns.LITERAL_BLOB[wid]
            this.bottomLayer.putTileAt(tileId, x, y)
        })

        this.graphics.clear()
        this.graphics.setDefaultStyles({
            lineStyle: { width: 3, color: 0xc3f2e8, alpha: 1 },
            fillStyle: { color: 0xffffff, alpha: 0.25 },
        })

        this.drawRect = new Geom.Rectangle(
            this.board.x + this.tileSize * this.cursor.x,
            this.board.y + this.tileSize * this.cursor.y,
            this.tileSize,
            this.tileSize
        )

        this.graphics.fillRectShape(this.drawRect)
        this.graphics.strokeRectShape(this.drawRect)
        this.graphics.strokeRect(
            EDITABLE_AREA.X,
            EDITABLE_AREA.Y,
            this.grid.pointwise.width * this.tileSize + 1,
            this.grid.pointwise.height * this.tileSize + 1
        )
        this.graphics.strokeRect(
            EDITABLE_AREA.X - 8,
            EDITABLE_AREA.Y - 8,
            this.grid.pointwise.width * this.tileSize + 16,
            this.grid.pointwise.height * this.tileSize + 16
        )
    }

    // UPDATE SCREEN COLORS
    updateGroupAlpha() {
        const alpha = this.mapLayer ? 0.25 : 1
        this.group.setAlpha(alpha)
    }

    updateCustomPipeline() {
        this.customPipeline.setFloat1('time', this.time)
        this.customPipeline.setFloat1('brigt', this.brigt)
        this.customPipeline.setFloat1('noiser', this.noise)
        this.customPipeline.setFloat1('r', this.R)
        this.customPipeline.setFloat1('b', this.B)
    }

    incrementTime() {
        this.time += 0.005
    }

    handlePointerAction(pointer) {
        this.saveState()
        if (pointer.leftButtonDown()) {
            this.handleDrawing(pointer)
        } else {
            this.handleErasing(pointer)
        }
    }

    /// DRAW GRID
    handleDrawing() {
        if (this.scene.isActive('editor')) {
            this.scene.remove('editor')
        }

        if (this.mapLayer) {
            this.applyGridMirrors()
        } else {
            this.applyUpperLayerMirrors()
        }
    }

    applyGridMirrors() {
        this.grid.set(this.cursor.x, this.cursor.y)

        if (this.mirror.x)
            this.grid.set(GRID_OFFSET.X - this.cursor.x, this.cursor.y)

        if (this.mirror.y)
            this.grid.set(this.cursor.x, GRID_OFFSET.Y - this.cursor.y)

        if (this.mirror.x && this.mirror.y) {
            this.grid.set(
                GRID_OFFSET.X - this.cursor.x,
                GRID_OFFSET.Y - this.cursor.y
            )
        }
    }

    applyUpperLayerMirrors() {
        this.placeTile(this.cursor.x, this.cursor.y)

        if (this.mirror.x)
            this.placeTile(
                GRID_OFFSET.X - this.cursor.x,
                this.cursor.y,
                true,
                false
            )

        if (this.mirror.y)
            this.placeTile(
                this.cursor.x,
                GRID_OFFSET.Y - this.cursor.y,
                false,
                true
            )

        if (this.mirror.x && this.mirror.y) {
            this.placeTile(
                GRID_OFFSET.X - this.cursor.x,
                GRID_OFFSET.Y - this.cursor.y,
                true,
                true
            )
        }

        this.propsTiles = this.upperLayer.culledTiles.map(
            ({ x, y, index }) => ({
                x,
                y,
                t: index,
            })
        )
        localStorage.setItem('props', JSON.stringify(this.propsTiles))
    }

    placeTile(x, y, flipX = false, flipY = false) {
        const tile = this.upperLayer.putTileAt(this.selectedTile, x, y)
        tile.setFlip(flipX, flipY)
    }

    /// ERASE GRID
    handleErasing() {
        this.saveState()
        if (this.mapLayer) {
            this.applyGridErasing()
        } else {
            this.applyUpperLayerErasing()
        }
    }

    applyGridErasing() {
        this.eraseGridTile(this.cursor.x, this.cursor.y)
        if (this.mirror.x) this.eraseGridTile(24 - this.cursor.x, this.cursor.y)
        if (this.mirror.y)
            this.eraseGridTile(this.cursor.x, GRID_OFFSET.Y - this.cursor.y)
        if (this.mirror.x && this.mirror.y) {
            this.eraseGridTile(
                24 - this.cursor.x,
                GRID_OFFSET.Y - this.cursor.y
            )
        }
    }

    applyUpperLayerErasing() {
        this.eraseUpperLayerTile(this.cursor.x, this.cursor.y)
        if (this.mirror.x)
            this.eraseUpperLayerTile(24 - this.cursor.x, this.cursor.y)
        if (this.mirror.y)
            this.eraseUpperLayerTile(
                this.cursor.x,
                GRID_OFFSET.Y - this.cursor.y
            )
        if (this.mirror.x && this.mirror.y) {
            this.eraseUpperLayerTile(
                24 - this.cursor.x,
                GRID_OFFSET.Y - this.cursor.y
            )
        }

        this.propsTiles = this.upperLayer.culledTiles.map(
            ({ x, y, index }) => ({
                x,
                y,
                t: index,
            })
        )
        localStorage.setItem('props', JSON.stringify(this.propsTiles))
    }

    eraseGridTile(x, y) {
        this.grid.unset(x, y)
    }

    eraseUpperLayerTile(x, y) {
        this.upperLayer.removeTileAt(x, y)
    }

    update() {
        if (this.killScene) return

        const pointer = this.input.activePointer

        if (pointer.isDown && this.drawing && pointer.x > EDITABLE_AREA.X) {
            this.handlePointerAction(pointer)
            localStorage.setItem('grid', JSON.stringify([...this.grid.grid]))
            this.updating = true
        }

        this.updateTexts()
        this.updateGroupAlpha()
        this.updateCustomPipeline()
        this.incrementTime()

        if (this.updating) {
            this.drawUI()
            this.updating = false
        }
    }
}
