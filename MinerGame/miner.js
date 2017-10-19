let Mine = function(obj){
    this.wrapper = obj.wrapper
    this.col = obj.col
    this.row = obj.row
    this.mineNum = obj.mineNum
    this.isGameStart = false   //游戏是否已开始
    this.mapInfo = [] //游戏地图信息，记录是否有雷
    this.mineInfo = [] //雷区信息
    this.button = obj.button //笑脸按钮
}
Mine.prototype = {
    init: function(){
        //初始化
        for(let i=0; i<this.col; i++){
            let colDom = document.createElement('ul')
            this.mapInfo.push([])
            this.wrapper.appendChild(colDom)
            for(let j=0; j<this.row; j++){
                let rowDom = document.createElement('li')
                this.mapInfo[i].push(new Field({
                    Mine: this,
                    x: i,
                    y: j,
                    dom: rowDom,
                }))
                colDom.appendChild(rowDom)
            }
        }
        this.preventRightClick() //阻止右键菜单
        this.initializable = true

    },
    gameWin: function(){
        this.button.innerHTML = '赢咯'
    },
    gameOver: function(){
        this.button.innerHTML = '输咯'
        this.mapInfo.forEach(function(col){
            col.forEach(function(field){
                field.showField()
            })
        })
    },
    restartGame: function(){
        this.button.innerHTML = '重来'
        this.mapInfo.forEach(function(col){
            col.forEach(function(field){
                field.init()
            })
        })
        this.isGameStart = false //游戏结束
    },
    createMine: function(){
        //生成雷区
        this.isGameStart = true //游戏开始
        let createdNum = 0 //已生成的雷数
        let mark = false //检测改坐标是否已经有雷
        while(createdNum < this.mineNum){
            let colPos = getRandom(this.col)
            let rowPos = getRandom(this.row)
            mark = this.mineInfo.find(mine => mine.x === colPos && mine.y === rowPos)
            if(!mark){
                //该区域标记为雷区
                this.mapInfo[colPos][rowPos].mineAround = -1
                this.mineInfo.push(this.mapInfo[colPos][rowPos])
                createdNum++
            }
        }
        this.createField()
        /* console.log(this.mineInfo)
        console.log(this.mapInfo) */
    },
    createField: function(){
        // 填充 mapInfo 中不是雷区的 mineAround
        let self = this
        this.mapInfo.forEach(function(col){
            for(let field of col){
                if(field.isMine()){
                    //该区域若是雷区则跳过
                    continue
                }
                //开始遍历每个区域周围的八个区域
                for(let x=field['x']-1; x<=field['x']+1; x++){
                    if(x===-1||x===self.col){
                        continue
                    }
                    for(let y=field['y']-1; y<=field['y']+1; y++){
                        if(y===-1||y===self.row){
                            continue
                        }else{
                            if(self.mapInfo[x][y].isMine()){
                                //有雷则 mineAround +1
                                field.mineAround++
                            }
                        }
    
                    }
                }
            }
        })
    },
    preventRightClick: function(){
        this.wrapper.oncontextmenu=function(event) {
		    if(document.all){
                // for IE
                window.event.returnValue = false
            }
		    else{
                event.preventDefault()
            }
		}
    }
}

let Field = function(obj){
    this.Mine = obj.Mine
    this.x = obj.x
    this.y = obj.y
    this.dom = obj.dom
    this.mineAround = 0 //该区域周围八个区域存在雷区的数量，-1代表自身是雷区
    this.isOpen = false
    this.isFlag = false
    this.dom.style.backgroundColor = '#bbb'

    //绑定事件
    this.dom.onclick = () => {
        //区域点击
        if(!this.Mine.isGameStart){
            this.Mine.createMine()
        }
        if(this.isOpen){
            //该区域已打开则退出函数
            return
        }
        if(this.isMine()){
            this.setBgColor().call(this, this.mineAround)
            this.dom.innerHTML = this.mineAround
            this.Mine.gameOver()
        }else{
            this.openField()
        }
    }
    this.dom.onmouseover = () => {
        if(!this.isOpen)this.dom.style.backgroundColor = '#ddd'
    }
    this.dom.onmouseout = () => {
        if(!this.isOpen)this.dom.style.backgroundColor = '#bbb'        
    }
    this.dom.onmouseup = (e) => {
        if (!e) e=window.event;
        if (e.button===2) {
            this.setFlag()
        }
    }
    this.dom.onmousedown = () => {
        this.openRestField()
    }

}
Field.prototype = {
    init: function(){
        this.mineAround = 0
        this.isOpen = false
        this.isFlag = false
        this.dom.style.backgroundColor = '#bbb'
        this.dom.innerHTML = ''
        this.dom.style.color = '#000'
        return this
    },
    setFlag: function(){
        if(!this.isOpen||(this.isOpen&&this.isFlag)){
            this.isFlag = this.isFlag?false:true
            this.isOpen = this.isFlag?true:false
            this.dom.innerHTML = this.isFlag?'旗':''
            if(this.checkMine()){
                this.Mine.gameWin()
            }
        }
        return this
    },
    checkMine: function(){
        return this.Mine.mineInfo.every(function(mineArea){
            //检查所有雷区是否插旗
            return mineArea.isFlag===true
        })
    },
    openRestField: function(){
        if(this.isOpen && !this.isFlag){
            if(this.getAroundField().filter(field => field.isFlag).length===this.mineAround){
                this.getAroundField().forEach(field => {
                    if(!field.isMine() && field.isFlag){
                        field.Mine.gameOver()
                    }
                    field.openField()
                })
            }
        }
    },
    openField: function(){
        if(!this.isOpen){
            this.isOpen = true
            if(this.mineAround===0){
            this.setBgColor().call(this, this.mineAround)
            //遍历周围的区域
            this.getAroundField().forEach(field => {
                // this.dom.innerHTML = this.mineAround
                field.openField()
            })
        }else{
            this.setBgColor().call(this, this.mineAround)
            this.dom.innerHTML = this.mineAround
        }
    }
        return this
    },
    isMine: function(){
        return this.mineAround === -1
    },
    showField: function(){
        this.isOpen = true
        if(!this.isFlag){
            this.dom.innerHTML = this.mineAround === 0?'':this.mineAround
            this.setBgColor().call(this, this.mineAround)
        }else{
            if(this.isMine()){
                return this
            }else{
                this.dom.innerHTML = 'X'
                this.dom.style.color = '#b11'
                this.setBgColor().call(this, this.mineAround)
            }
        }
        return this
    },
    setBgColor: function(mineAround){
        let colorBase = {
            '-1': '#b11',
            '0' : '#eee',
            '1' : '#ccc'
        },
        self = this
        return function(){
            if(this.mineAround>0){
                self.dom.style.backgroundColor = colorBase['1']
                return this
            }else{
                self.dom.style.backgroundColor = colorBase[this.mineAround]
                return this
            }
        }
    },
    getAroundField: function(){
        let aroundFieldArr = [],
            mapInfo = this.Mine.mapInfo,
            col = this.Mine.col,
            row = this.Mine.row,
            x = this.x,
            y = this.y
        
        if(x-1>=0){
            aroundFieldArr.push(mapInfo[x-1][y])
            if(y-1>=0){
                aroundFieldArr.push(mapInfo[x-1][y-1])
            }
            if(y+1<row){
                aroundFieldArr.push(mapInfo[x-1][y+1])
            }
        }
        if(x+1<col){
            aroundFieldArr.push(mapInfo[x+1][y])
            if(y-1>=0){
                aroundFieldArr.push(mapInfo[x+1][y-1])
            }
            if(y+1<row){
                aroundFieldArr.push(mapInfo[x+1][y+1])
            }
        }
        if(y-1>=0){
            aroundFieldArr.push(mapInfo[x][y-1])
        }
        if(y+1<row){
            aroundFieldArr.push(mapInfo[x][y+1])
        }
        console.log(aroundFieldArr)
        return aroundFieldArr
        /* return aroundFieldArr.filter(function(field){
            return field.isOpen === false
        }) */
    }
}

//全局方法
function getRandom(n){
    //获取 0 到 n 之间的随机整数
    return Math.floor(Math.random()*n)
}