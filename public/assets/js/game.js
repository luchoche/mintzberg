const inputMessage = document.getElementById('inputMessage');
const messages = document.getElementById('messages');

/*window.addEventListener('keydown', event => {
  if (event.which === 13) {
    sendMessage();
  }
  if (event.which === 32) {
    if (document.activeElement === inputMessage) {
      inputMessage.value = inputMessage.value + ' ';
    }
  }
});*/

/*function sendMessage() {
  let message = inputMessage.value;
  if (message) {
    inputMessage.value = '';
    $.ajax({
      type: 'POST',
      url: '/submit-chatline',
      data: {
        message,
        refreshToken: getCookie('refreshJwt')
      },
      success: function(data) {},
      error: function(xhr) {
        console.log(xhr);
      }
    })
  }
}

function addMessageElement(el) {
  messages.append(el);
  messages.lastChild.scrollIntoView();
}*/

class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene',
      active: true
    });
  }

  preload() {
    // map tiles
    this.load.image('tiles', 'assets/map/spritesheet-extruded.png');
    // map in json format
    this.load.tilemapTiledJSON('map', 'assets/map/map.json');
    // our two characters
    this.load.spritesheet('player', 'assets/RPG_assets.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image('fondo', 'assets/images/fondo.png');
    this.load.image('golem', 'assets/images/coppergolem.png');
    this.load.image('ent', 'assets/images/dark-ent.png');
    this.load.image('demon', 'assets/images/demon.png');
    this.load.image('worm', 'assets/images/giant-worm.png');
    this.load.image('wolf', 'assets/images/wolf.png');
    this.load.image('sword', 'assets/images/attack-icon.png');
    this.load.image('box', 'assets/images/box.png');
    this.load.image('boton', 'assets/images/boton.png');
    this.load.image('boton2', 'assets/images/boton.png');
    this.load.image('osito', 'assets/images/birrete.png');
    this.load.image('basura', 'assets/images/basura.png');
    this.load.image('mesa', 'assets/images/mesa.png');
    this.load.image('pizarron', 'assets/images/piz.png');
    this.load.image('camion', 'assets/images/camion.png');
  }

  create() {
    this.scene.start('WorldScene');
  }
}

class WorldScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'WorldScene'
    });
  }

  create() {
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    //esenario
    this.fondo = this.add.image(0, 0, 'fondo').setOrigin(0);
    this.puerta = this.add.sprite(-40, 400, 'camion');
    this.physics.world.enable(this.puerta);
    this.puerta.body.setImmovable();
    this.mesa = this.add.group();
    this.mesa1 = this.mesa.create(300, 450, 'mesa');
    this.physics.world.enable(this.mesa1);
    this.mesa1.body.setImmovable();
    this.mesa2 = this.mesa.create(150, 350, 'mesa');
    this.physics.world.enable(this.mesa2);
    this.mesa2.body.setImmovable();
    this.mesa3 = this.mesa.create(600, 350, 'mesa');
    this.physics.world.enable(this.mesa3);
    this.mesa3.body.setImmovable();
    //pizarrón
    this.pizarron = this.add.sprite(800, 100, 'pizarron');
    this.physics.world.enable(this.pizarron);
    this.pizarron.body.setImmovable();
    this.score = 0;
    this.scoreText = this.add.text(790, 80, '0', { fontSize: '32px', fill: '#000' });
    //botones
    this.boton = this.add.sprite(1200, 450, 'boton');
    this.physics.world.enable(this.boton);
    this.boton.body.setImmovable();
    this.boton2 = this.add.sprite(900, 450, 'boton2');
    this.physics.world.enable(this.boton2);
    this.boton2.body.setImmovable();
    this.boton3 = this.add.sprite(1270, 100, 'boton');
    this.physics.world.enable(this.boton3);
    this.boton3.body.setImmovable();
    this.boton4 = this.add.sprite(50, 100, 'boton');
    this.physics.world.enable(this.boton4);
    this.boton4.body.setImmovable();

    this.cajaTomada = true;
    
    // don't go out of the map
    this.physics.world.setBounds(0, 0, 1300, 500);

    // create player animations
    this.createAnimations();

    // user input
    this.cursors = this.input.keyboard.createCursorKeys();

    // listen for web socket events
    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === this.socket.id) {
          this.createPlayer(players[id]);
        } else {
          this.addOtherPlayers(players[id]);
        }
      }.bind(this));
    }.bind(this));

    this.socket.on('newPlayer', function (playerInfo) {
      this.addOtherPlayers(playerInfo);
    }.bind(this));

    this.socket.on('disconnect', function (playerId) {
      this.otherPlayers.getChildren().forEach(function (player) {
        if (playerId === player.playerId) {
          player.destroy();
        }
      }.bind(this));
    }.bind(this));

    this.socket.on('playerMoved', function (playerInfo) {
      this.otherPlayers.getChildren().forEach(function (player) {
        if (playerInfo.playerId === player.playerId) {
          player.flipX = playerInfo.flipX;
          player.setPosition(playerInfo.x, playerInfo.y);
        }
      }.bind(this));
    }.bind(this));

    this.socket.on('boxMoved', function (boxInfo) {
      console.log('x: ' + boxInfo.x + '  ' + 'y: ' + boxInfo.y);
      this.tomarCaja = false;
      this.caja.x = boxInfo.x;
      this.caja.y = boxInfo.y;
    }.bind(this));

    this.socket.on('boton1', function () {
      if(this.boxs.getChildren().length == 0){
        this.caja = this.boxs.create(1200, 300, 'box');
        this.physics.world.enable(this.caja);
        this.caja.body.setCollideWorldBounds(true);
        this.caja.setPosition(1200, 300);
        // this.caja.body.setVelocityY(100);
        // setTimeout(() => {
        //   this.caja.body.setVelocityY(0);
        // }, 500);
        // this.caja.body.setVelocityX(-100);
        // setTimeout(() => {
        //   this.caja.body.setVelocityX(0);
        //   //this.caja.position.x = 500;
        // }, 4000);
      }
    }.bind(this));

    this.socket.on('boton2', function () {
      this.caja.setPosition(900, 300);
      if(this.boxs.getChildren().length != 0){
        if(this.caja.x < 1000){
          if(this.frecOsito){
            //this.socket.emit('pressbot2');
            this.osito = this.add.sprite(900, 200, 'osito');
            this.osito.setScale(2);
            this.physics.world.enable(this.osito);
            this.physics.add.existing(this.osito);
            this.osito.body.setCollideWorldBounds(true);
            this.osito.body.setVelocityY(50);
            this.frecOsito = false;
          }
          //choque caja oso
          this.physics.add.overlap(this.caja, this.osito, function(uno, dos){
            this.frecOsito = true;
            dos.destroy();
            
            //choque caja personaje
            this.physics.add.overlap(this.caja, this.container,function(uno,dos){
              this.tomarCaja = true;
              if(this.cajaTomada){
                this.caja.setPosition(-50,0);
                this.caja.setScale(.5);
                this.container.add(this.caja);
                this.cajaTomada = false;
                this.socket.emit('cajatomada');
              }
              //choque caja puerta
              this.physics.add.collider(this.caja, this.puerta,function(uno,dos){
                this.socket.emit('enviocaja');
                this.caja.destroy();
                this.tomarCaja = false;
                this.cajaTomada = true;
                if(!this.basura){
                  this.basura = this.physics.add.group();
                }
                for (var i = 0; i < 5; i++) {
                  //const location = this.getValidLocation();
                  // parameters are x, y, width, height
                  var xbasura;
                  var ybasura;
                  xbasura = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
                  ybasura = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
                  this.basura2 = this.basura.create(xbasura, ybasura, 'basura');
                  this.basura2.body.setCollideWorldBounds(true);
                  this.basura2.body.setImmovable();
                }
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }
      }
      // if(this.boxs.getChildren().length != 0){
      //   this.caja.setPosition(900, 400);
      //   if(this.caja.x < 1000){
      //     this.osito = this.add.sprite(900, 250, 'osito');
      //     this.osito.setScale(2);
      //     this.physics.world.enable(this.osito);
      //     this.physics.add.existing(this.osito);
      //     //this.osito.body.setVelocityY(50).setCollideWorldBounds(true);
      //     this.osito.body.setVelocityY(50);
      //     this.physics.add.overlap(this.caja, this.osito, function(uno, dos){
      //       dos.destroy();
      //       this.sostener = 'ok';
      //       this.physics.add.overlap(this.caja, this.container,function(uno,dos){
      //         this.tomarCaja = true;
      //         this.caja.setPosition(-50,0);
      //         this.container.add(this.caja);
      //         this.physics.add.collider(this.caja, this.puerta,function(uno,dos){
      //           this.tomarCaja = false;
      //           this.caja.destroy();
      //         }.bind(this));
      //       }.bind(this));
      //     }.bind(this));
      //     console.log('sostener: ' + this.sostener);
      //   }
      // }
    }.bind(this));

    this.socket.on('boton3', function (playerInfo) {
      if(this.basura){
          this.basura.clear(this,true,true);
          console.log('basura destruida');
      }
    }.bind(this));

    this.socket.on('pizarron', function (playerInfo) {
      this.score = this.score + 1;
      this.scoreText.setText(this.score);
    }.bind(this));

    this.socket.on('notomarcaja', function (playerInfo) {
      this.cajaTomada = false;
    }.bind(this));

    this.socket.on('cajaenviada', function (playerInfo) {
      this.cajaTomada = true;
      this.caja.destroy();
      if(!this.basura){
        this.basura = this.physics.add.group();
      }
      for (var i = 0; i < 5; i++) {
        //const location = this.getValidLocation();
        // parameters are x, y, width, height
        var xbasura;
        var ybasura;
        xbasura = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        ybasura = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
        this.basura2 = this.basura.create(xbasura, ybasura, 'basura');
        this.basura2.body.setCollideWorldBounds(true);
        this.basura2.body.setImmovable();
      }
    }.bind(this));

    this.socket.on('boton4', function (playerInfo) {
      console.log(playerInfo + 'servidor boton4');
      this.mesa.clear(this,true,true);
      this.mesa = this.add.group();
      this.mesa1 = this.mesa.create(300, 200, 'mesa');
      this.mesa2 = this.mesa.create(150, 200, 'mesa');
      this.mesa3 = this.mesa.create(600, 200, 'mesa');
    }.bind(this));

    //  this.input.on('pointerdown', function(pointer){
    //    this.container.setPosition(pointer.x, pointer.y);
    //    this.physics.moveToObject(this.container, pointer, 240);
    //  }, this);
    this.input.on('pointerdown', pointer => {
      const distance = Math.abs(this.container.body.x - pointer.downX);
      const walkingVelocity = 50;
      const duration = (distance / walkingVelocity) * 100;
    
      this.tweens.add({
        targets: this.container,
        x: pointer.downX,
        y: pointer.downY,
        duration
      });
    });
    this.frecOsito = true;
    this.isClicking = true;

    this.input.keyboard.on('keydown_W', function(){
      this.socket.emit('enviocaja');
      this.caja.destroy();
    }, this);

  }

  //-------------------------------------------------------------------

  createMap() {
    // create the map
    this.map = this.make.tilemap({
      key: 'map'
    });

    // first parameter is the name of the tilemap in tiled
    var tiles = this.map.addTilesetImage('spritesheet', 'tiles', 16, 16, 1, 2);

    // creating the layers
    this.map.createStaticLayer('Grass', tiles, 0, 0);
    this.map.createStaticLayer('Obstacles', tiles, 0, 0);

    // don't go out of the map
    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
  }

  createAnimations() {
    //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });

    // animation with key 'right'
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [2, 8, 2, 14]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [0, 6, 0, 12]
      }),
      frameRate: 10,
      repeat: -1
    });
  }

  createPlayer(playerInfo) {
    // our player sprite created through the physics system
    this.player = this.add.sprite(0, 0, 'player', 6);
    this.player.setOrigin(1.4,1.4);
    this.container = this.add.container(playerInfo.x, playerInfo.y);
    this.container.setSize(40,40);
    this.container.setScale(3);
    this.physics.world.enable(this.container);
    this.container.add(this.player);

    // add weapon
    this.weapon = this.add.sprite(10, 0, 'sword');
    this.weapon.setScale(0.5);
    this.weapon.setSize(8, 8);
    this.physics.world.enable(this.weapon);

    //this.container.add(this.weapon);
    this.attacking = false;

    // update camera
    //this.updateCamera();

    // don't go out of the map
    this.container.body.setCollideWorldBounds(true);
    this.osito;
    //this.physics.add.overlap(this.weapon, this.spawns, this.onMeetEnemy, false, this);
    this.physics.add.collider(this.container, this.pizarron, function(uno, dos){
      this.frec = true;
        dos
        .setInteractive()
        .on('pointerdown', () => {
          if(this.frec){
            this.socket.emit('presspiz');
            this.score += 1;
            this.scoreText.setText(this.score);
            dos.removeInteractive();
            this.frec = false;
          }
        });
    }.bind(this));
    this.physics.add.collider(this.container, this.boton, function(uno, dos){
      this.socket.emit('pressbot1');
      // console.log('Se crea caja');
      // this.frec = true;
      //   dos
      //   .setInteractive()
      //   .on('pointerdown', () => {
      //     console.log('se crea caja dentro de ponterdown');
      //     if(this.frec){
      //       //logica de interación con primer boton
      //       if(this.boxs.getChildren().length == 0){
      //         console.log('si box esta vacio');
      //         this.socket.emit('pressbot1');
      //         this.caja = this.boxs.create(1200, 350, 'box');
      //         //this.caja.setSize(10,10);
      //         //this.caja.setScale(.1);
      //         this.physics.world.enable(this.caja);
      //         this.caja.body.setCollideWorldBounds(true);
      //         //this.physics.add.collider(this.boxs, this.container);
      //         //this.caja.body.setImmovable();
      //         this.caja.body.setVelocityY(100);
      //         setTimeout(() => {
      //           this.caja.body.setVelocityY(0);
      //         }, 500);
      //         this.caja.position.x = 500;
      //         console.log(this.caja.position.x);
      //         // this.caja.body.setVelocityX(-100);
      //         // setTimeout(() => {
      //         //   this.caja.body.setVelocityX(0);
      //         // }, 3000);
      //         //this.physics.add.collider(this.boxs, this.mesa);
      //         this.frec = false;
      //       }
      //       //fin lógica de interacción
            
      //     }
      //   });
    }.bind(this));
    this.physics.add.collider(this.container, this.boton2, function(uno, dos){
      this.socket.emit('pressbot2');
        // dos
        // .setInteractive()
        // .on('pointerdown', () => {
        //   if(this.boxs.getChildren().length != 0){
        //     if(this.caja.x < 1000){
        //       if(this.frecOsito){
        //         this.socket.emit('pressbot2');
        //         this.osito = this.add.sprite(900, 250, 'osito');
        //         this.osito.setScale(2);
        //         this.physics.world.enable(this.osito);
        //         this.physics.add.existing(this.osito);
        //         this.osito.body.setCollideWorldBounds(true);
        //         this.osito.body.setVelocityY(50);
        //         this.frecOsito = false;
        //       }
        //       //choque caja oso
        //       this.physics.add.overlap(this.caja, this.osito, function(uno, dos){
        //         this.frecOsito = true;
        //         dos.destroy();
        //         this.sostener = 'ok';
        //         //choque caja personaje
        //         this.physics.add.overlap(this.caja, this.container,function(uno,dos){
        //           this.tomarCaja = true;
        //           if(this.cajaTomada){
        //             this.caja.setPosition(-50,0);
        //             this.caja.setScale(.5);
        //             this.container.add(this.caja);
        //             this.cajaTomada = false;
        //             this.socket.emit('cajatomada');
        //           }
        //           //choque caja puerta
        //           this.physics.add.collider(this.caja, this.puerta,function(uno,dos){
        //             this.socket.emit('enviocaja');
        //             this.caja.destroy();
        //             this.tomarCaja = false;
        //             this.cajaTomada = true;
        //             if(!this.basura){
        //               this.basura = this.physics.add.group();
        //             }
        //             for (var i = 0; i < 5; i++) {
        //               //const location = this.getValidLocation();
        //               // parameters are x, y, width, height
        //               var xbasura;
        //               var ybasura;
        //               xbasura = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        //               ybasura = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
        //               this.basura2 = this.basura.create(xbasura, ybasura, 'basura');
        //               this.basura2.body.setCollideWorldBounds(true);
        //               this.basura2.body.setImmovable();
        //             }
        //           }.bind(this));
        //         }.bind(this));
        //       }.bind(this));
        //     }
        //   }
        // });
    }.bind(this));
    this.physics.add.collider(this.container, this.boton3, function(uno, dos){
      this.frec = true;
        dos
        .setInteractive()
        .on('pointerdown', () => {
          if(this.frec){
            console.log('basurin');
            //logica de interación con primer boton
            if(this.basura){
                this.socket.emit('pressbot3');
                this.basura.clear(this,true,true);
                console.log('basura destruida local');
            }
            this.frec = false;
            //fin lógica de interacción
          }
          
        });
    }.bind(this));
    this.physics.add.collider(this.container, this.boton4, function(){
      this.socket.emit('pressbot4');
      console.log('dentro de collider');
      // this.mesa.children.each((mesita) => {
      //   console.log('dentro de foreach mesa');
      //   mesita.body.position.y = 200;
      // });
    }.bind(this));

    //this.physics.add.collider(this.container, this.spawns);
    this.physics.add.collider(this.container, this.mesa);

    var arma = 'si';
    this.boxs = this.physics.add.group({
      classType: Phaser.GameObjects.Sprite
    });

  }

  posicion (uno, dos){
    console.log('dentro de collider');
    this.mesa.children.each((mesita) => {
        console.log('dentro de foreach mesa');
        mesita.body.position.y = 200;
    });
  }

  addOtherPlayers(playerInfo) {
    const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'player', 9);
    otherPlayer.setTint(Math.random() * 0xffffff);
    otherPlayer.playerId = playerInfo.playerId;
    this.otherPlayers.add(otherPlayer);
    otherPlayer.setScale(3);
  }

  updateCamera() {
    // limit camera to map
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.container);
    this.cameras.main.roundPixels = true; // avoid tile bleed
  }

  createEnemies() {
    // where the enemies will be
    this.spawns = this.physics.add.group({
      classType: Phaser.GameObjects.Sprite
    });
    for (var i = 0; i < 20; i++) {
      const location = this.getValidLocation();
      // parameters are x, y, width, height
      var enemy = this.spawns.create(location.x, location.y, this.getEnemySprite());
      enemy.body.setCollideWorldBounds(true);
      enemy.body.setImmovable();
    }

    // move enemies
    this.timedEvent = this.time.addEvent({
      delay: 3000,
      callback: this.moveEnemies,
      callbackScope: this,
      loop: true
    });
  }

  moveEnemies () {
    this.spawns.getChildren().forEach((enemy) => {
      const randNumber = Math.floor((Math.random() * 4) + 1);

      switch(randNumber) {
        case 1:
          enemy.body.setVelocityX(50);
          break;
        case 2:
          enemy.body.setVelocityX(-50);
          break;
        case 3:
          enemy.body.setVelocityY(50);
          break;
        case 4:
          enemy.body.setVelocityY(50);
          break;
        default:
          enemy.body.setVelocityX(50);
      }
    });

    setTimeout(() => {
      this.spawns.setVelocityX(0);
      this.spawns.setVelocityY(0);
    }, 500);
  }

  getEnemySprite() {
    var sprites = ['golem', 'ent', 'demon', 'worm', 'wolf'];
    return sprites[Math.floor(Math.random() * sprites.length)];
  }

  onMeetCaja(player, enemy) {
    console.log('player y caja se tocan');
    return this.container.add(enemy);
  }

  getValidLocation() {
    var validLocation = false;
    var x, y;
    while (!validLocation) {
      x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);

      var occupied = false;
      this.spawns.getChildren().forEach((child) => {
        if (child.getBounds().contains(x, y)) {
          occupied = true;
        }
      });
      if (!occupied) validLocation = true;
    }
    return { x, y };
  }

  onMeetEnemy(player, enemy) {
    if (this.attacking) {
      const location = this.getValidLocation();
      enemy.x = location.x;
      enemy.y = location.y;
    }
  }
  onMeetOsito(player, enemy) {
    enemy.destroy();
    this.sostener = 'ok';
    return this.sostener;
  }

  update() {
  //   console.log(this.cajaTomada);
  //   console.log('mover mesa ' + this.moverMesa);
  //  console.log('osito: ' + this.frecOsito);
    // if(this.container){
    //   if(!this.input.activePointer.isDown && this.isClicking == true) {
    //       this.container.setData("positionY", this.input.activePointer.position.y);
    //       this.container.setData("positionX", this.input.activePointer.position.x);
    //       this.isClicking = false;
    //   } else if(this.input.activePointer.isDown && this.isClicking == false) {
    //     this.isClicking = true;
    //   }

    //   if(Math.abs(this.container.y - this.container.getData("positionY")) <= 10) {
    //       this.container.y = this.container.getData("positionY");
    //   } else if(this.container.y < this.container.getData("positionY")) {
    //     this.container.y += 5;
    //   } else if(this.container.y > this.container.getData("positionY")) {
    //     this.container.y -= 5;
    //   }
    //   if(Math.abs(this.container.x - this.container.getData("positionX")) <= 10) {
    //       this.container.x = this.container.getData("positionX");
    //   } else if(this.container.x < this.container.getData("positionX")) {
    //     this.container.x += 5;
    //   } else if(this.container.y > this.container.getData("positionX")) {
    //     this.container.x -= 5;
    //   }
    // }

    if (this.container) {
      this.container.body.setVelocity(0);
      //console.log('siguiendo 4: ' + this.siguiendo);
      // Horizontal movement
      if (this.cursors.left.isDown) {
        this.container.body.setVelocityX(-120);
      } else if (this.cursors.right.isDown) {
        this.container.body.setVelocityX(120);
      }

      // Vertical movement
      if (this.cursors.up.isDown) {
        this.container.body.setVelocityY(-120);
      } else if (this.cursors.down.isDown) {
        this.container.body.setVelocityY(120);
      }

      // Update the animation last and give left/right animations precedence over up/down animations
      if (this.cursors.left.isDown) {
        this.player.anims.play('left', true);
        this.player.flipX = true;

        this.weapon.flipX = true;
        this.weapon.setX(-10);
      } else if (this.cursors.right.isDown) {
        this.player.anims.play('right', true);
        this.player.flipX = false;

        this.weapon.flipX = false;
        this.weapon.setX(10);
      } else if (this.cursors.up.isDown) {
        this.player.anims.play('up', true);
      } else if (this.cursors.down.isDown) {
        this.player.anims.play('down', true);
      } else {
        this.player.anims.stop();
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.attacking && document.activeElement !== inputMessage) {
        this.attacking = true;
        setTimeout(() => {
          this.attacking = false;
          this.weapon.angle = 0;
        }, 150);
      }

      if (this.attacking) {
        if (this.weapon.flipX) {
          this.weapon.angle -= 10;
        } else {
          this.weapon.angle += 10;
        }
      }

      // emit player movement
      var x = this.container.x;
      var y = this.container.y;
      var flipX = this.player.flipX;
      if (this.container.oldPosition && (x !== this.container.oldPosition.x || y !== this.container.oldPosition.y || flipX !== this.container.oldPosition.flipX)) {
        this.socket.emit('playerMovement', { x, y, flipX });
      }
      // save old position data
      this.container.oldPosition = {
        x: this.container.x,
        y: this.container.y,
        flipX: this.player.flipX
      };
      if(this.tomarCaja){
        console.log('la caja fue tomada');
        // emit box movement
        var x = this.container.x;
        var y = this.container.y;
        if (this.caja.oldPosition && (x !== this.caja.oldPosition.x || y !== this.caja.oldPosition.y)) {
          console.log('se emitió');
          x = this.container.x - 50;
          this.socket.emit('boxMovement', {x, y});
        }
        // save old position data
        this.caja.oldPosition = {
          x: this.container.x,
          y: this.container.y
        };
      }

    }

  }

}

var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 1300,
  height: 500,
  backgroundColor: '#A1C3D4',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      },
      debug: false // set to true to view zones
    }
  },
  scene: [
    BootScene,
    WorldScene
  ]
};
var game = new Phaser.Game(config);