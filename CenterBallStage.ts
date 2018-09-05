const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class CenterBallStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    centerBall : LinkedCenterBall = new LinkedCenterBall()
    animator : Animator = new Animator()
    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.centerBall.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.centerBall.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.centerBall.update(() =>{
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : CenterBallStage = new CenterBallStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class CBNode {
    prev : CBNode
    next : CBNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new CBNode(this.i + 1)
            this.next.prev = this
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : CBNode {
        var curr : CBNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }

    draw(context : CanvasRenderingContext2D) {
        context.fillStyle = '#388E3C'
        const gap : number = h / (nodes + 1)
        const index1 : number = this.i % 2
        const index2 : number = (this.i + 1) % 2
        const r : number = gap / 4
        const x : number = (w -r) * index2 + r * index1
        const y : number = this.i * gap + gap/2 + r
        const sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2
        const newX = x + (w / 2 - x) * sc1
        const newY = y  + (h + r - y) * sc2
        context.save()
        context.translate(newX, newY)
        context.beginPath()
        context.arc(0, 0, r, 0, 2 * Math.PI)
        context.fill()
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }
}

class LinkedCenterBall {
    root : CBNode = new CBNode(0)
    curr : CBNode = this.root
    dir : number = 1
    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
