/* Zmienne globalne */
var myJumpGameSection;
var myObstacles = [];
var myHitSound;
var myBackgroundMusic;
var myScore;

/* Wczytywanie nowej gry po przegranej */
function restartJumpGame() 
{
	document.getElementById("scoreboard").style.display = "none";
	myJumpGameArea.stop();
	myJumpGameArea.clear();
	myJumpGameArea = {};
	myJumpGameSection = {};
	myObstacles = [];
	myHitSound = {};
	myBackgroundMusic = {};
	myScore = {};
	document.getElementById("canvasUnit").innerHTML = "";
	startJumpGame()
}

/* Deklaracje obiektów */
function startJumpGame() 
{
	myJumpGameArea = new gameArea();
	myJumpGameSection = new component(64, 64, "img/char.gif", 50, 240, "image");
	myScore = new component("20px", "Consolas", "white", 10, 20, "text");
	myHitSound = new sound("sounds/hitObstacle.mp3");
	myWinnerAplauseSound = new sound("sounds/winnerAplauseSound.mp3");
	myBackgroundMusic = new sound("sounds/relaxingBackgroundMusic.mp3");
    myBackgroundMusic.play();
    myJumpGameArea.start();
}

/* Okno Canvas, Animacja (płynność, klatki), Sterowanie */
function gameArea() 
{
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth; //dostosowanie do fullscreen
    this.canvas.height = window.innerHeight; //dostosowanie do fullscreen    
    document.getElementById("canvasUnit").appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.pause = false;
    this.frameNumber = 0;
    this.start = function() 
	{
        this.interval = setInterval(updateGameArea, 10); //ilość klatek defautl: 20
		window.addEventListener('keydown', function (e) //sterowanie za pomocą klawiatury
		{
            myJumpGameArea.key = e.keyCode;
        })
		window.addEventListener('keyup', function (e) 
		{
            myJumpGameArea.key = false;
        })
    },
    this.stop = function() 
	{
        clearInterval(this.interval);
        this.pause = true;
    }
    this.clear = function()
	{
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

/*Progress bar map escape*/
function move() {
  var elem = document.getElementById("myBar");   
  var width = 0;
  var id = setInterval(frame, 1);
  function frame() {
    if (width >= 20000) {
      clearInterval(id);
    } else {
      width++; 
      elem.style.width = width/200 + '%'; 
      elem.innerHTML = width * 1/200  + '%';
    }
  }
}

/* Tworzenie elementów składowych gry */
function component(width, height, color, x, y, type) 
{
    this.type = type;
	if (this.type == "image") //mozliwość dodania skórek elementów
	{
		this.image = new Image();
		this.image.src = color;
	}
	if (this.type == "text") 
	{
		this.text = new Text();
        this.text = color;
    }
    this.score = 0; //wynik początkowy // domyślnie 0 // do sprawdzenia warunku wygranej 19000
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.speedX = 0;
    this.speedY = 0;    
    this.gravity = 0.1;
    this.gravitySpeed = 0.1;
	this.update = function() 
	{
        ctx = myJumpGameArea.context;
		/* Wyświetlanie score */
		if (this.type == "text") 
		{
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } 
		/* Wyświetlanie elementów jako grafika */
        if (this.type == "image") 
		{
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } 
		else 
		{
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
	}
    this.newPos = function() 
	{
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function() 
	{
        var dno = myJumpGameArea.canvas.height - this.height;
        if (this.y > dno) 
		{
            this.y = dno;
            this.gravitySpeed = 0;
        }
    }
	this.crashWith = function(otherobj) 
	{
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
               (mytop > otherbottom) ||
               (myright < otherleft) ||
               (myleft > otherright)) 
		{
           crash = false;
        }
        return crash;
    }
}
/* Obsługa plików muzycznych - background/hitsound */
function sound(src) 
{
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function()
	{
        this.sound.play();
    }
    this.stop = function()
	{
        this.sound.pause();
    }    
}

/* Funkcja odpowiedzialna za: czestotliwość, szybkość poruszania się, wielkość generowanych przeszkód,
odtwarzanie / stopowanie muzyki po uderzeniu w pszeszkodę, wyświetlanie scoreboard, nowe pozycje obiektów,
obsługę sterowania za pomocą spacji, zliczanie klatek oraz postępu gry */

function everyInterval(n) 
{
    if ((myJumpGameArea.frameNumber / n) % 1 == 0)
		{
		return true;
		}
    return false;
}

function updateGameArea() 
{
    var x, y;
    for (i = 0; i < myObstacles.length; i += 1) 
	{
        if (myJumpGameSection.crashWith(myObstacles[i])) 
		{
			myHitSound.play();
			myBackgroundMusic.stop();
            myJumpGameArea.stop();
            document.getElementById("scoreboard").style.display = "flex";
            return;
        } 
    }
    myJumpGameArea.clear();
    myJumpGameArea.frameNumber += 1;
	myScore.score +=1;
    if (myJumpGameArea.frameNumber == 1 || everyInterval(150)) //co jaki czas przeszkoda // modyfikacja do HardRock'a
	{
        x = myJumpGameArea.canvas.width;
        y = myJumpGameArea.canvas.height - 40; // modyfikacja do HardRock'a default 40 // do sprawdzenia warunku wygranej (-1)
        myObstacles.push(new component(10, 200, "yellow", x, y)); // modyfikacja do HardRock'a oraz Hidden'a
    }
    for (i = 0; i < myObstacles.length; i += 1) 
	{
        myObstacles[i].x += -5; //predkość mapy // modyfikacja do DoubleTime'a
        myObstacles[i].update();
    }
	myScore.text="SCORE: " + myScore.score;        
    myScore.update();        
	myJumpGameSection.speedX = 0;
    myJumpGameSection.speedY = 0; 
	/* sterowanie za pomocą spacji kod 32 */
    if (myJumpGameArea.key && myJumpGameArea.key == 32) 
	{
		myJumpGameSection.speedY = -4.5; //predkość wznoszenia sie
	} 
	/*Jeżeli wynik osiagnie 20000 punktów - przeszedłeś grę na 100% bez uderzenia w przeszkodę*/
	if ( myScore.score == 20000) 
	{
		myBackgroundMusic.stop();
        myJumpGameArea.stop();
		myWinnerAplauseSound.play();
        document.getElementById("scoreboard-win").style.display = "flex";
        return;
	} 
    myJumpGameSection.newPos(); 
    myJumpGameSection.update();
	myBackgroundMusic.play();
}

/* MODYFIKACJE + INNE */
/* 
DoubleTime - Zwiekszona predkość mapy - mnożnik score * 1.15.
HardRock - Zwiekszenie ilości przeszkód oraz ich wysokosci i szerokości - mnożnik score * 1.20.
Hidden - Przeszkody pokazują się na chwilę po czym znikają - mnożnik score * 1.25.

Długość gry:
Czas muzyki w sekundach * ilość klatek na sek = czas gry.
PĘTLA + SCOREBOARD

Szanse:
3 Życia plus bonusy:
1: mnoznik score * 1.1;
2: mnoznik score * 1.2;
3: mnoznik score * 1.3;

INFORMACJA:
BONUSY Z MODYFIKACJI I ZYCIA ŁACZĄ SIĘ :) MAX score * 1.80
*/


