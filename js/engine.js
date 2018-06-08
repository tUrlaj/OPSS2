/* Zmienne globalne */
var myJumpGameSection;
var myObstacles = [];
var myHitSound;
var myBackgroundMusic;
var myScore;
var life = 1000;
var scoreMultiplerByHP = 1;
var scoreMultiplerByMODS = 0;
var DT = 1;
var HR = 1;
var HD = 1;

/* Wczytywanie nowej gry po przegranej */
function restartJumpGame() 
{
	document.getElementById("scoreboard").style.display = "none";
	document.getElementById("scoreboard-win").style.display = "none";
	myJumpGameArea.stop();
	myWinnerAplauseSound.stop();
	myBackgroundMusic.stop(); //tuuuuuuuuuuu
	myJumpGameArea.clear();
	myJumpGameArea = {};
	myJumpGameSection = {};
	myObstacles = [];
	myHitSound = {};
	myBackgroundMusic = {};
	myScore = {};
	life = 1000;
	scoreMultiplerByHP = 1;
	scoreMultiplerByMODS = 0;
	/* jezeli button resetuj mody*/
	//DT = 0;
	//HR = 0;
	//HD = 0;
	myFrames = {};
	myLifes = {};
	document.getElementById("canvasUnit").innerHTML = "";
	startJumpGame()
}

/* Deklaracje obiektów */
function startJumpGame() 
{
	myJumpGameArea = new gameArea();
	myJumpGameSection = new component(64, 64, "img/char.gif", 50, 240, "image");
	myScore = new component("20px", "Consolas", "white", 10, 50, "text");
	myFrames = new component("20px", "Consolas", "white", 185, 32, "text");
	myLifes = new component("20px", "Consolas", "white", 410, 32, "text");
	myHitSound = new sound("sounds/hitObstacle.mp3");
	myWinnerAplauseSound = new sound("sounds/winnerAplauseSound.mp3");
	myBackgroundMusic = new sound("sounds/relaxingBackgroundMusic.mp3");
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
        this.interval = setInterval(updateGameArea, 5); //ilość klatek defautl: 20 ;; 38760 dla 5
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
    this.score = 0; //wynik początkowy // domyślnie 0 // do sprawdzenia warunku wygranej 38000
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
		if (myJumpGameSection.crashWith(myObstacles[i])) //po uderzeniu w przeszkode odejmij x hp ponizej 0 zakoncz gre
		{
			if(life > 0)
			{
				life -= 2; // dodanie losowości 
			}
			else
			{
				/* Jeśli zycie spadnie do 0 pkt wyswietlany informacje o przegranej*/
				myHitSound.play();
				myBackgroundMusic.stop();
				myJumpGameArea.stop();
				document.getElementById("scoreboard").style.display = "flex";
				document.getElementById("status").innerHTML = "PORAŻKA!";
				document.getElementById("score").innerHTML = "Twój całkowity wynik to: " + myScore.score * (scoreMultiplerByHP + scoreMultiplerByMODS);
				return;
			}
        } 

		/* Jeżeli wynik osiagnie 38400 punktów wyswietlamy informacje o wygranej */
		if ( myScore.score == 38400) 
		{
			myBackgroundMusic.stop();
			myWinnerAplauseSound.play();
			myJumpGameArea.stop();
			document.getElementById("scoreboard-win").style.display = "flex";
			document.getElementById("status-win").innerHTML = "WYGRANA!";
			document.getElementById("score-win").innerHTML = "Twój całkowity wynik to: " + myScore.score * (scoreMultiplerByHP + scoreMultiplerByMODS);
			return;
		} 
    }
	
    myJumpGameArea.clear();
    myJumpGameArea.frameNumber += 1;
	myScore.score +=1;
    if (myJumpGameArea.frameNumber == 1 || everyInterval(150)) //co jaki czas przeszkoda // modyfikacja do HardRock'a
	{
        x = myJumpGameArea.canvas.width;
        y = myJumpGameArea.canvas.height - 70; // modyfikacja do HardRock'a default 70 // do sprawdzenia warunku wygranej (-1)
        myObstacles.push(new component(45, 83, "img/spikes.png", x, y, "image"));
    }
    for (i = 0; i < myObstacles.length; i += 1) 
	{
		//if(myScore.score < 19850){ // myJumpGameArea.frameNumber < 1000 // znikanie przeszkód
        myObstacles[i].x += -3; //predkość mapy // modyfikacja do DoubleTime'a
        myObstacles[i].update();
		//}
		//myObstacles[i].update();
    }
	
	/* Mnoznik pkt dla punktów życia */
	if(life == 1000){scoreMultiplerByHP = 1.6}
	if(life <= 950){scoreMultiplerByHP = 1.5}
	if(life <= 900){scoreMultiplerByHP = 1.4}
	if(life <= 600){scoreMultiplerByHP = 1.3}
	if(life <= 400){scoreMultiplerByHP = 1.2}
	if(life <= 200){scoreMultiplerByHP = 1.1}
	if(life == 0){scoreMultiplerByHP = 1}
	/* Mnoznik pkt dla pojedyńczych modyfikacji */
	if(DT == 1){scoreMultiplerByMODS = 0.10}
	if(HR == 1){scoreMultiplerByMODS = 0.15}
	if(HD == 1){scoreMultiplerByMODS = 0.25}
	/* Mnoznik pkt dla wielu modyfikacji */
	if(DT == 1 && HR == 1){scoreMultiplerByMODS = 0.25}
	if(DT == 1 && HD == 1){scoreMultiplerByMODS = 0.35}
	if(HD == 1 && HR == 1){scoreMultiplerByMODS = 0.40}
	if(DT == 1 && HD == 1 && HR == 1){scoreMultiplerByMODS = 0.50}
	
	
	/* HUB: */
	myFrames.text="PROGRESS: " + (Math.round(myScore.score / 384 * 100) / 100) + "%";
	myFrames.update();
	myScore.text="SCORE: " + myScore.score + "*" + scoreMultiplerByHP + "*" + scoreMultiplerByMODS;        
    myScore.update();
	myLifes.text="LIFE: " + life + "/1000";        
    myLifes.update();
	
	/* Aktualizacja paska postepu */
	document.getElementById("myBar").style.width = myScore.score/384 + '%';
	document.getElementById("myHP").style.width = life/25 + '%';
	
	myJumpGameSection.speedX = 0;
    myJumpGameSection.speedY = 0; 
	
	/* sterowanie za pomocą spacji kod 32 */
    if (myJumpGameArea.key && myJumpGameArea.key == 32) 
	{
		myJumpGameSection.speedY = -6; //predkość wznoszenia sie
	} 
	
    myJumpGameSection.newPos(); 
    myJumpGameSection.update();
	myBackgroundMusic.play();
}


