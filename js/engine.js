/* Zmienne globalne */
let myJumpGameSection;
let myObstacles = [];
let myFailSound;
let myBackgroundMusic;
let myScore;
let scoreMultiplerByHP = 1;
let scoreMultiplerByMODS = 0;
let life = 1000;
let DT = 0;
let HR = 0;
let frequencyObstacles;

/* Wczytywanie nowej gry po przegranej */
function restartJumpGame() 
{
	document.getElementById("scoreboard").style.display = "none";
	document.getElementById("scoreboard-win").style.display = "none";
	myJumpGameArea.stop();
	myWinnerAplauseSound.stop();
	myBackgroundMusic.stop();
	myJumpGameArea.clear();
	myJumpGameArea = {};
	myJumpGameSection = {};
	myObstacles = [];
	myFailSound = {};
	myHitSound = {};
	myJumpSound = {};
	myBackgroundMusic = {};
	myScore = {};
	life = 1000;
	scoreMultiplerByHP = 1;
	scoreMultiplerByMODS = 0;
	myFrames = {};
	myLifes = {};
	myMulti = {};
	document.getElementById("canvasUnit").innerHTML = "";
	startJumpGame()
}

/* Deklaracje obiektów */
function startJumpGame() 
{
	document.getElementById("myBar").style.display = "flex";
	document.getElementById("myHP").style.display = "flex";
	document.getElementById("home-mods").style.display = "none";
	myJumpGameArea = new gameArea();
	myJumpGameSection = new component(64, 64, "img/char.gif", 50, 240, "image");
	myScore = new component("20px", "Consolas", "white", 10, 32, "text");
	myFrames = new component("20px", "Consolas", "white", 185, 32, "text");
	myLifes = new component("20px", "Consolas", "white", 410, 32, "text");
	myMulti = new component("20px", "Consolas", "white", 600, 32, "text");
	myFailSound = new sound("sounds/failSound.mp3");
	myHitSound = new sound("sounds/hitObstacle.mp3");
	myWinnerAplauseSound = new sound("sounds/winnerAplauseSound.mp3");
	myJumpSound = new sound("sounds/jumpSound.mp3");
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
        this.interval = setInterval(updateGameArea, 5); //ilość klatek 5ms odswierzania dla 38760
		window.addEventListener('keydown', function (e) //sterowanie za pomocą klawiatury
		{
            myJumpGameArea.key = e.keyCode;
			myJumpSound.play();
        })
		window.addEventListener('keyup', function (e) 
		{
            myJumpGameArea.key = false;
			myJumpSound.stop();
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
	if ( this.type == "image" ) //mozliwość dodania skórek elementów
	{
		this.image = new Image();
		this.image.src = color;
	}
	if ( this.type == "text" ) 
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
		if ( this.type == "text" ) 
		{
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } 
		/* Wyświetlanie elementów jako grafika */
        if ( this.type == "image" ) 
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
        let dno = myJumpGameArea.canvas.height - this.height;
        if (this.y > dno) 
		{
            this.y = dno;
            this.gravitySpeed = 0;
        }
    }
	this.crashWith = function(otherobj) 
	{
        let myleft = this.x;
        let myright = this.x + (this.width);
        let mytop = this.y;
        let mybottom = this.y + (this.height);
        let otherleft = otherobj.x;
        let otherright = otherobj.x + (otherobj.width);
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + (otherobj.height);
        let crash = true;
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

/* Obsługa plików muzycznych */
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
    if ( (myJumpGameArea.frameNumber / n) % 1 == 0 )
	{
		return true;
	}
    return false;
}

/* Sprawdzanie włączonych modyfikacji */
function checkbox()
{
	if( document.forms.form1.dt.checked == true )
	{
		DT = 1;
	}
	else
	{
		DT = 0;
	}
	if( document.forms.form1.hr.checked == true)
	{
		HR = 1;
	}
	else
	{
		HR = 0;
	}
}

function updateGameArea() 
{
    let x, y;
    for ( i = 0; i < myObstacles.length; i += 1 ) 
	{
		if (myJumpGameSection.crashWith(myObstacles[i])) //po uderzeniu w przeszkode odejmij x hp ponizej 0 zakoncz gre
		{
			if( life > 0 ) // Jeżeli uderzymy w przeszkodę
			{
				myHitSound.play();
				life -= Math.floor((Math.random() * 5) + 1); // dodanie losowości od 1-5 
			}
			else
			{
				/* Jeśli zycie spadnie do 0 pkt wyswietlany informacje o przegranej*/
				myBackgroundMusic.stop();
				myFailSound.play();
				myJumpGameArea.stop();
				document.getElementById("scoreboard").style.display = "flex";
				document.getElementById("status").innerHTML = "PORAŻKA!";
				document.getElementById("score").innerHTML = "Twój całkowity wynik to: " + (Math.round(myScore.score * (scoreMultiplerByHP + scoreMultiplerByMODS)*100)/100);
				return;
			}
        } 

		/* Jeżeli wynik osiagnie 38400 punktów wyswietlamy informacje o wygranej */
		if ( myScore.score == 38400 ) 
		{
			myBackgroundMusic.stop();
			myWinnerAplauseSound.play();
			myJumpGameArea.stop();
			document.getElementById("scoreboard-win").style.display = "flex";
			document.getElementById("status-win").innerHTML = "WYGRANA!";
			document.getElementById("score-win").innerHTML = "Twój całkowity wynik to: " + (Math.round(myScore.score * (scoreMultiplerByHP + scoreMultiplerByMODS)*100)/100);
			return;
		} 
    }
	
    myJumpGameArea.clear();
    myJumpGameArea.frameNumber += 1;
	myScore.score +=1;
	if ( DT == 1  ){frequencyObstacles = 100;}else{frequencyObstacles = 150;} //
    if ( myJumpGameArea.frameNumber == 1 || everyInterval(frequencyObstacles) ) //co jaki czas przeszkoda // modyfikacja do HardRock'a
	{
		if (HR == 1)
		{
			x = myJumpGameArea.canvas.width;
			minHeight = 10;
			maxHeight = 11;
			height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
			minGap = 80;
			maxGap = 100;
			gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
			y = myJumpGameArea.canvas.height;
			myObstacles.push(new component(45, x + height - gap, "img/spikes.png", x, y - height - gap, "image"));
		}
		else
		{
			x = myJumpGameArea.canvas.width;
			y = myJumpGameArea.canvas.height - 70; // modyfikacja do HardRock'a default 70 // do sprawdzenia warunku wygranej (-1)
			myObstacles.push(new component(45, 83, "img/spikes.png", x, y, "image"));
		}
    }
    for ( i = 0; i < myObstacles.length; i += 1 ) 
	{
        myObstacles[i].x += -3;
        myObstacles[i].update();
    }
	
	/* Mnoznik pkt dla punktów życia */
	if( life == 1000 ){scoreMultiplerByHP = 1.6}
	if( life <= 950 ){scoreMultiplerByHP = 1.5}
	if( life <= 900 ){scoreMultiplerByHP = 1.4}
	if( life <= 600 ){scoreMultiplerByHP = 1.3}
	if( life <= 400 ){scoreMultiplerByHP = 1.2}
	if( life <= 200 ){scoreMultiplerByHP = 1.1}
	if( life <= 0 ){scoreMultiplerByHP = 1}
	/* Mnoznik pkt dla pojedyńczych modyfikacji */
	if( DT == 1 ){scoreMultiplerByMODS = 0.15}
	if( HR == 1 ){scoreMultiplerByMODS = 0.20}
	/* Mnoznik pkt dla wielu modyfikacji */
	if( DT == 1 && HR == 1 ){scoreMultiplerByMODS = 0.35}
	
	/* HUB: */
	myFrames.text="PROGRESS: " + (Math.round(myScore.score / 384 * 100) / 100) + "%";
	myFrames.update();
	myScore.text="SCORE: " + myScore.score;        
    myScore.update();
	myLifes.text="LIFE: " + life + "/1000";        
    myLifes.update();
	myMulti.text="SxHP: " + scoreMultiplerByHP + " + SxMODS: " + scoreMultiplerByMODS;        
    myMulti.update();
	
	/* Aktualizacja paska postepu */
	document.getElementById("myBar").style.width = myScore.score/384 + '%';
	document.getElementById("myHP").style.width = life/25 + '%';
	
	myJumpGameSection.speedX = 0;
    myJumpGameSection.speedY = 0; 
	
	/* sterowanie za pomocą spacji kod 32 */
    if ( myJumpGameArea.key && myJumpGameArea.key == 32 ) 
	{
		myJumpGameSection.speedY = -6; //predkość wznoszenia sie
	} 
	
    myJumpGameSection.newPos(); 
    myJumpGameSection.update();
	myBackgroundMusic.play();
}


