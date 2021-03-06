import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  DOWN_ARROW = 40,
  UP_ARROW = 38
}

class Ghost {
  className: string;
  startIndex: number;
  speed: number;
  currentIndex: number;
  previousIndex: number;
  isScared: boolean;
  timerId: number;

  constructor(className, startIndex, speed) {
      this.className = className;
      this.startIndex = startIndex;
      this.speed = speed;
      this.currentIndex = startIndex;
      this.previousIndex = startIndex;
      this.isScared = false
      this.timerId = NaN
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'angular-pacman';
  width: number = 28;
  scoreValue = 0;
  
  // layout
  // legend
    // 0 - pac dot
    // 1 wall
    // 2 - ghost lair
    // 3 - power pellet
    // 4 - empty
  layout = [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,1,1,2,2,1,1,1,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
      4,4,4,4,4,4,0,0,0,4,1,2,2,2,2,2,2,1,4,0,0,0,4,4,4,4,4,4,
      1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,3,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,3,1,
      1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
      1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
      1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,
      1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
      1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
  ]

  squares = [];
  pacmanCurrentIndex = 490;
  ghosts = [
    new Ghost('blinky', 348, 300),
    new Ghost('pinky', 376, 400),
    new Ghost('inky', 351, 320),
    new Ghost('clyde', 379, 500)
  ]

  @ViewChild('grid') grid: ElementRef;
  @ViewChild('score') score: ElementRef;
  @ViewChild('result') result: ElementRef;
  
  @HostListener('document:keyup', ['$event'])
  KeyUpEvent(event: KeyboardEvent) {
    this.renderer.removeClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if(
          this.pacmanCurrentIndex - this.width >= 0 &&
          !this.squares[this.pacmanCurrentIndex + 1].classList.contains('wall') &&
          !this.squares[this.pacmanCurrentIndex + 1].classList.contains('ghost-lair')
      )
      this.pacmanCurrentIndex += 1
      if ( this.squares[this.pacmanCurrentIndex +1] === this.squares[392]) {
          this.pacmanCurrentIndex = 364
      }
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if(
        this.pacmanCurrentIndex % this.width !== 0 &&
        !this.squares[this.pacmanCurrentIndex - 1].classList.contains('wall') &&
        !this.squares[this.pacmanCurrentIndex - 1].classList.contains('ghost-lair')
      )
      this.pacmanCurrentIndex -= 1
      if ( this.squares[this.pacmanCurrentIndex -1] === this.squares[363]){
          this.pacmanCurrentIndex = 391
      }
    }

    if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      if ( 
          this.pacmanCurrentIndex + this.width < this.width * this.width &&
          !this.squares[this.pacmanCurrentIndex + this.width].classList.contains('wall') &&
          !this.squares[this.pacmanCurrentIndex + this.width].classList.contains('ghost-lair') 
      )
      this.pacmanCurrentIndex += this.width
    }

    if (event.keyCode === KEY_CODE.UP_ARROW) {
      console.log("Up");
      if(
        this.pacmanCurrentIndex - this.width >= 0 &&
        !this.squares[this.pacmanCurrentIndex - this.width].classList.contains('wall') &&
        !this.squares[this.pacmanCurrentIndex - this.width].classList.contains('ghost-lair') 
      )
      this.pacmanCurrentIndex -= this.width
    }
    this.renderer.addClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
    this.pacDotEaten();
    this.powerPelletEaten();
    this.checkForGameOver(this.squares, this.pacmanCurrentIndex);
    this.checkforWin();
  }
  
  constructor(private renderer: Renderer2, private elem: ElementRef){

  }


  /**
   * Generate the 28x28 grid board
   */
  createBoard(){
    for (let i = 0; i < this.layout.length; i++){
        const square = this.renderer.createElement('div');
        this.renderer.appendChild(this.grid.nativeElement, square);
        this.squares.push(square)
        
        if(this.layout[i] === 0){
          this.renderer.addClass(this.squares[i], 'pac-dot');
        } else if (this.layout[i] === 1){
          this.renderer.addClass(this.squares[i], 'wall');
        } else if (this.layout[i] === 2) {
          this.renderer.addClass(this.squares[i], 'ghost-lair');
        } else if (this.layout[i] === 3){
          this.renderer.addClass(this.squares[i], 'power-pellet');
        }
    }
  }

  ngOnInit() {
    
  }

  // init all the ghosts from the array
  // randonmy set interval to move the ghost around.
  initGhosts(){
    this.ghosts.forEach(ghost =>{
      this.squares[ghost.currentIndex].classList.add('ghost');
      this.squares[ghost.currentIndex].classList.add(ghost.className);
      this.moveGhost(ghost);
    });

  }

  /**
   * 
   * @param ghost Randomly move the ghost
   */
  moveGhost(ghost) {
    // please implement this.
    var widthX = this.width;
    var squaresY = this.squares;
    var scoreValX = this.scoreValue;
    var pacmanCurrentIndexX = this.pacmanCurrentIndex;
    var checkForGameOverX = this.checkForGameOver;
    ghost.timerId = setInterval(function() {
      const directions = [-1 , +1, +widthX, -widthX];
      let direction = directions[Math.floor(Math.random() * directions.length)];
      console.log(direction);
      if (!squaresY[ghost.currentIndex + direction].classList.contains('ghost') &&
             !squaresY[ghost.currentIndex + direction].classList.contains('wall')
      ) {
        squaresY[ghost.currentIndex].classList.remove(ghost.className);
        squaresY[ghost.currentIndex].classList.remove('ghost', 'scared-ghost');
        ghost.currentIndex += direction
        ghost.previousIndex = ghost.currentIndex;
        squaresY[ghost.currentIndex].classList.add(ghost.className, 'ghost');
      }else {
        direction = directions[Math.floor(Math.random() * directions.length)];
      }
      if (ghost.isScared) {
        squaresY[ghost.currentIndex].classList.add('scared-ghost')
      }

      if(ghost.isScared && squaresY[ghost.currentIndex].classList.contains('pac-man')) {
        squaresY[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
          ghost.currentIndex = ghost.startIndex
          scoreValX +=100
          squaresY[ghost.currentIndex].classList.add(ghost.className, 'ghost')
      }
      checkForGameOverX(squaresY, pacmanCurrentIndexX);
    }, ghost.speed);
  }

  /**
   * Check whether the game is over. if the pacman touches the ghost when it is not isScared
   * then end the game by removing the keyUp event from the window/document.
   */
  checkForGameOver(squaresX, pacmanCurrentIndexX) {
      if (squaresX[pacmanCurrentIndexX].classList.contains('ghost') &&
          !squaresX[pacmanCurrentIndexX].classList.contains('scared-ghost')
      ) {
        this.ghosts.forEach(ghost=> clearInterval(ghost.timerId))
        this.KeyUpEvent = function() : void {};
        this.result.nativeElement.innerHTML = "Game Over!";
      }

  }


  /**
   * Check whether has pacman consume all the pellet from the grid
   * if yes then display the winning message
   */
  checkforWin() {
    if(this.scoreValue === 274) {
        this.ghosts.forEach(ghost => clearInterval(ghost.timerId))
        this.KeyUpEvent = function() : void {};
        this.result.nativeElement.innerHTML = "You have Won!";
    }
  }

  /**
   * Initialize the board by generating 28x28 grid
   * Render the initial start position of the pacman
   * Also render the all the ghosts within the array list
   */
  ngAfterViewInit() {
    // create the pac man board
    this.createBoard();
    this.renderer.addClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
    this.initGhosts();
  }

  /**
   * What happens when pacman isbusy eating the small pellet
   * Increment the score
   * Remove the small pellet from the grid once is consume by pacman
   */
  pacDotEaten() {
      if( this.squares[this.pacmanCurrentIndex].classList.contains('pac-dot')) {
          this.scoreValue++
          this.score.nativeElement.innerHTML = this.scoreValue;
          this.squares[this.pacmanCurrentIndex].classList.remove('pac-dot');
      }
  }

  /**
   * Once pacman consume the power pellet it gain super power
   * All the ghost will be afraid of em.
   * By right the ghost should run away from pacman as much as possible
   * Set an timeout for the ghost to turn back to hunting mode rather than 
   * scare of pacman.
   */
  powerPelletEaten() {
      if( this.squares[this.pacmanCurrentIndex].classList.contains('power-pellet')) {
          this.scoreValue+=10
          this.score.nativeElement.innerHTML = this.scoreValue;
          this.ghosts.forEach(ghost => {
            ghost.isScared = true;
            console.log("turn to scared of pacman");
            // turn the ghost colour to aquamarine.
            this.squares[ghost.currentIndex].classList.add(ghost.className, 'ghost', 'scared-ghost');
          });
          setTimeout(()=>{
            this.ghosts.forEach(ghost => {
                ghost.isScared = false
                this.squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
                ghost.currentIndex = ghost.startIndex
                this.squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
            })
          }, 10000)
          this.squares[this.pacmanCurrentIndex].classList.remove('power-pellet');
      }
  }
}
