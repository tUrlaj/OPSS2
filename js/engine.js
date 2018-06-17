/* Zmienne globalne */
let myJumpGameSection;
let myObstacles = [];
let myFailSound;
let myBackgroundMusic;
let myScore;
let scoreMultiplerByHP = 1;
let scoreMultiplerByMODS = 0;
let DT;
let HR;
let SD;
let frequencyObstacles;

/* Wczytywanie nowej gry po zresetownaiu nie liczy sie F5 (refresh) */
function restartJumpGame() 
{
	/* Zmiana scoreboard i scoreboard-win przez atr display na niewidoczne */
	document.getElementById("scoreboard").style.display = "none";
	document.getElementById("scoreboard-win").style.display = "none";
	/* Stopowanie muzyki */
	myJumpGameArea.stop();
	myWinnerAplauseSound.stop();
	myBackgroundMusic.stop();
	myJumpGameArea.clear();//czyszczenie areny
	/* Elementy gry */
	myJumpGameArea = {};
	myJumpGameSection = {};
	myObstacles = [];
	myFailSound = {};
	myHitSound = {};
	myJumpSound = {};
	myBackgroundMusic = {};
	myScore = {};
	/* Przyjmowanie na nowo wartości zmiennych */
	scoreMultiplerByHP = 1; //domyślna wartość mnożnika punktów przez poziom życia
	scoreMultiplerByMODS = 0; //domyślna wartość mnożnika punktów przez wybór modyfikacji
	/* Paski postepu oraz wartości multiplera */
	myFrames = {};
	myLifes = {};
	myMulti = {};
	document.getElementById("canvasUnit").innerHTML = "";
	startJumpGame() //rozpoczecie nowej gry
}

/* Deklaracje obiektów */
function startJumpGame() 
{
	checkbox(); //sprawdzanie właczonych modyfikacji
	document.getElementById("myBar").style.display = "flex"; //zmiana atr display z none na flex dla id myBar - wyswietlenie tylko w trybie gry
	document.getElementById("myHP").style.display = "flex"; //zmiana atr display z none na flex dla id myHP - wyswietlenie tylko w trybie gry
	document.getElementById("home-mods").style.display = "none"; //zmiana atr display z flex na none - wyswietlenie tylko w trybie wyboru modyfikacji
	myJumpGameArea = new gameArea(); //załadowanie nowej Areny 
	//Wyswietlanie elementów gry (na sztywno) np: 64 , 64 wielkość obrazka(wielkość czcionki w trybie text + rodzaj czcionki), zródło (kolor czcionki w trybie text), 50, 240 - położenie, typ: text / image
	myJumpGameSection = new component(64, 64, "img/char.gif", 50, 240, "image");
	myScore = new component("20px", "Consolas", "white", 10, 32, "text");
	myFrames = new component("20px", "Consolas", "white", 185, 32, "text");
	myLifes = new component("20px", "Consolas", "white", 410, 32, "text");
	myMulti = new component("20px", "Consolas", "white", 600, 32, "text");
	/* Obsługa plików muzycznych */
	myFailSound = new sound("sounds/failSound.mp3");
	myHitSound = new sound("sounds/hitObstacle.mp3");
	myWinnerAplauseSound = new sound("sounds/winnerAplauseSound.mp3");
	myJumpSound = new sound("sounds/jumpSound.mp3");
	myBackgroundMusic = new sound("sounds/relaxingBackgroundMusic.mp3");
    /* Rozpoczęcie gry */
	myJumpGameArea.start();
}

/* Okno Canvas, Animacja (płynność, klatki), Sterowanie */
function gameArea() 
{
    this.canvas = document.createElement("canvas"); //tworzenie okna canvas
    this.canvas.width = window.innerWidth; //dostosowanie do fullscreen
    this.canvas.height = window.innerHeight; //dostosowanie do fullscreen    
    document.getElementById("canvasUnit").appendChild(this.canvas); //do czego ma byc podporzadkowane okno canvas
    this.context = this.canvas.getContext("2d");
    this.pause = false;
    this.frameNumber = 0; //liczba klatek 
    this.start = function() 
	{
        this.interval = setInterval(updateGameArea, 5); //ilość klatek 5ms odswierzania dla 38400
		window.addEventListener('keydown', function (e) //sterowanie za pomocą klawiatury wcisniecie, zwolnienie przycisku
		{
            myJumpGameArea.key = e.keyCode;
			myJumpSound.play(); //odtwarzanie muzyki skoku
        })
		window.addEventListener('keyup', function (e) 
		{
            myJumpGameArea.key = false;
			myJumpSound.stop(); //zastopowanie muzyki skoku
        })
    },
    this.stop = function() 
	{
        clearInterval(this.interval); //czyszczenie interwału klatek
        this.pause = true;
    }
    this.clear = function()
	{
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //czyszczenie starych położeń obiektów
    }
}

/* Tworzenie elementów składowych gry */
function component(width, height, color, x, y, type) 
{
    this.type = type;
	if ( this.type == "image" ) //obsługa graficznych elementów gry
	{
		this.image = new Image();
		this.image.src = color;
	}
	if ( this.type == "text" ) //obsługa tekstowych elementów gry i HUB'a
	{
		this.text = new Text();
        this.text = color;
    }
    this.score = 0; //wynik początkowy // domyślnie 0 // do sprawdzenia warunku wygranej ustaw 38000 - koniec gry na 38400 klatek/score
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.speedX = 0; //przyspieszenie x
    this.speedY = 0; //przyspieszenie y    
    this.gravity = 0.1; //"moc" przyciagania
    this.gravitySpeed = 0.1; //przyspieszenie grawitacyjne
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
    this.sound.setAttribute("preload", "auto"); //automatyczne odtwarzanie po interakcji
    this.sound.setAttribute("controls", "none"); //bez kontrolerów
    this.sound.style.display = "none"; //bez wyświetlania odtwarzacza
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

/* Funkcje odpowiedzialne za: czestotliwość, szybkość poruszania się, wielkość generowanych przeszkód,
odtwarzanie / stopowanie muzyki po uderzeniu w pszeszkodę, wyświetlanie scoreboard dla różnych stanów gry, nowych pozycji obiektów,
obsługę sterowania za pomocą spacji, zliczanie klatek oraz postępu gry, mnożników punktów itd. */
function everyInterval(n) 
{
    if ( (myJumpGameArea.frameNumber / n) % 1 == 0 )
	{
		return true;
	}
    return false;
}

/* Sprawdzanie włączonych modyfikacji z checkboxów */
function checkbox()
{
	/* Jesli którakolwiek modyfikacja jest wyłaczona ustawiamy */
	if( document.forms.mods.dt.checked == false || document.forms.mods.hr.checked == false || document.forms.mods.sd.checked == false)
	{
		life = 1000; //punkty życia
	}
	/*Jesli modyfikacja DT - DoubleTime jest właczona */
	if( document.forms.mods.dt.checked == true )
	{
		DT = 1;
		life = 1000; //punkty życia
	}
	else
	{
		DT = 0;
	}
	/*Jesli modyfikacja HR - HardRock jest właczona */
	if( document.forms.mods.hr.checked == true )
	{
		HR = 1;
		life = 1000; //punkty życia
	}
	else
	{
		HR = 0;
	}
	/*Jesli modyfikacja SD - SuddenDeath jest właczona */
	if( document.forms.mods.sd.checked == true )
	{
		SD = 1;
		life = 1; //punkty życia
	}
	else
	{
		SD = 0;
	}
}

function updateGameArea() 
{
    let x, y;
    for ( i = 0; i < myObstacles.length; i += 1 ) //sprawdzanie w którą przeszkode uderzyliśmy 
	{
		if (myJumpGameSection.crashWith(myObstacles[i])) //po uderzeniu w przeszkode odejmij x hp ponizej 0 zakoncz gre
		{
			if( life > 0 ) //jeżeli uderzymy w przeszkodę
			{
				myHitSound.play(); //odtwarzanie dzwieku uderzenia w przeszkodę 
				life -= Math.floor((Math.random() * 5) + 1); // dodanie losowości utraty punktów życia po uderzeniu
			}
			else
			{
				/* Jeśli zycie spadnie do 0 pkt wyswietlany informacje o przegranej*/
				myBackgroundMusic.stop(); //zatrzymanie muzyki w tle
				myFailSound.play(); //odtwaraznie muzyki porażki
				myJumpGameArea.stop(); //zatrzymywanie gry
				document.getElementById("scoreboard").style.display = "flex"; //zmiana niewidocznych elementów z none na flex - div id scoreboard
				document.getElementById("status").innerHTML = "PORAŻKA!"; //wyswietlenie informacji o przegranej
				document.getElementById("score").innerHTML = "Twój całkowity wynik to: " + (Math.round(myScore.score * (scoreMultiplerByHP + scoreMultiplerByMODS)*100)/100); //wyswietlenie inforemacji o całkowitym wyniku po przegranej - 2 miejsca po przecinku
				return;
			}
        } 

		/* Jeżeli wynik osiagnie 38400 punktów wyswietlamy informacje o wygranej */
		if ( myScore.score == 38400 ) 
		{
			myBackgroundMusic.stop(); //zatrzymanie muzyki w tle
			myWinnerAplauseSound.play(); //odtwaraznie muzyki wygranej
			myJumpGameArea.stop(); //zatrzymywanie gry
			document.getElementById("scoreboard-win").style.display = "flex"; //zmiana niewidocznych elementów z none na flex - div id scoreboard-win
			document.getElementById("status-win").innerHTML = "WYGRANA!"; //wyswietlenie informacji o wygranej
			document.getElementById("score-win").innerHTML = "Twój całkowity wynik to: " + (Math.round(myScore.score * (scoreMultiplerByHP + scoreMultiplerByMODS)*100)/100); //wyswietlenie inforemacji o całkowitym wyniku po przegranej - 2 miejsca po przecinku
			return;
		} 
    }
	
    myJumpGameArea.clear(); 
    myJumpGameArea.frameNumber += 1; //zwiekszanie liczby klatek o 1 - równoważne z myScore.score
	myScore.score +=1; //zwiekszanie wyniku o 1 - równowazne z myJumpGameArea.frameNumber
	if ( DT == 1  ){frequencyObstacles = 100;}else{frequencyObstacles = 150;} //Zmiana czestotliwości generowania przeszków w trybie DT (DoubleTime)
    if ( myJumpGameArea.frameNumber == 1 || everyInterval(frequencyObstacles) ) //funkcja generująca przeszkody
	{
		if (HR == 1) //dla modyfikacji HR (HardRock), inaczej zdefiniowane warunki tworzenia przeszkód
		{
			x = myJumpGameArea.canvas.width; //pobieranie szerokości okna canvas
			minHeight = 10; //minimalna wysokość do algorytmu
			maxHeight = 11; //maksymalna wysokośc do algorytmu
			height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight); //algorytm generujący wysokość przeszkód
			minGap = 80; //minimalna luka miedzy przeszkodami
			maxGap = 100; //maksymalna luka miedzy przeszkodami
			gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap); //algorym obliczający przerwy miedzy przeszkodami
			y = myJumpGameArea.canvas.height; //pobieranie wysokości okna canvas
			myObstacles.push(new component(45, x + height - gap, "img/spikes.png", x, y - height - gap, "image")); //"wyrzucanie" przeszkody na plansze
		}
		else//dla podstawowego trybu gry bez nodyfikacji
		{
			x = myJumpGameArea.canvas.width; //pobieranie szerokości okna canvas
			y = myJumpGameArea.canvas.height - 83; //pobieranie wysokości okna canvas i ustawienie wielkości przeszkód równo z podłożem
			myObstacles.push(new component(45, 83, "img/spikes.png", x, y, "image")); //"wyrzucanie" przeszkody na plansze
		}
    }
    for ( i = 0; i < myObstacles.length; i += 1 ) //"generowanie" nowych przeszkód
	{
        myObstacles[i].x += -3;
        myObstacles[i].update();
    }
	

	/* Mnoznik pkt dla punktów życia bez trybu Easy! oraz SuddenDeath */
	if( life == 1000 ){scoreMultiplerByHP = 1.6}
	if( life <= 950 ){scoreMultiplerByHP = 1.5}
	if( life <= 900 ){scoreMultiplerByHP = 1.4}
	if( life <= 600 ){scoreMultiplerByHP = 1.3}
	if( life <= 400 ){scoreMultiplerByHP = 1.2}
	if( life <= 200 ){scoreMultiplerByHP = 1.1}
	if( life <= 0 ){scoreMultiplerByHP = 1}
	
	/* Mnoznik pkt dla punktów życia w trybie SuddenDeath */
	if( SD == 1 ){scoreMultiplerByHP = 1.7;}
	if( SD == 1 && HR == 1 ){scoreMultiplerByHP = 1.8;}
	if( SD == 1 && HR == 1 && DT == 1 ){scoreMultiplerByHP = 1.9;}

	/* Mnoznik pkt dla pojedyńczych modyfikacji */
	if( DT == 1 ){scoreMultiplerByMODS = 0.15}
	if( HR == 1 ){scoreMultiplerByMODS = 0.20}
	if( SD == 1 ){scoreMultiplerByMODS = 0.25}
	
	/* Mnoznik pkt dla 2 modyfikacji */
	if( DT == 1 && HR == 1 ){scoreMultiplerByMODS = 0.35}
	if( DT == 1 && SD == 1 ){scoreMultiplerByMODS = 0.40}
	if( SD == 1 && HR == 1 ){scoreMultiplerByMODS = 0.55}
	
	/* Mnoznik pkt dla 3 modyfikacji */
	if( DT == 1 && HR == 1 && SD == 1 ){scoreMultiplerByMODS = 0.60}
	
	/* HUB: - informacje podczas rozgrywki */
	/* Wyświetlanie procenta przejścia mapy w locie */
	myFrames.text="PROGRESS: " + (Math.round(myScore.score / 384 * 100) / 100) + "%";
	myFrames.update();
	/* Wyświetlanie wyniku w locie */
	myScore.text="SCORE: " + myScore.score;        
    myScore.update();
	/* Wyświetlanie ilości pkt życia w locie */
	myLifes.text="LIFE: " + life;        
    myLifes.update();
	/* Wyświetlanie wartości mnożników pkt w locie */
	myMulti.text="SxHP: " + scoreMultiplerByHP + " + SxMODS: " + scoreMultiplerByMODS;        
    myMulti.update();
	
	/* Aktualizacja paska postepu (myBar - przejścia mapy) oraz (myHP - punktów życia) */
	document.getElementById("myBar").style.width = myScore.score/384 + '%';//zmiana wartości atrybutu width id myBar dzielone przez 384 zmiana co 1% szerokości okna canvas
	document.getElementById("myHP").style.width = life/25 + '%';//zmiana wartości atrybutu width id myBar dzielone przez 25 aby pasek był 1/4 szerokosci okna canvas
	
	myJumpGameSection.speedX = 0; //przyspiesznie postaci wzgledem osi X
    myJumpGameSection.speedY = 0;  //przyspiesznie postaci wzgledem osi Y 
	
	/* sterowanie za pomocą spacji kod 32 */
    if ( myJumpGameArea.key && myJumpGameArea.key == 32 ) 
	{
		myJumpGameSection.speedY = -6; //predkość wznoszenia sie
	} 
	
    myJumpGameSection.newPos(); //sprawdzanie nowej pozycji 
    myJumpGameSection.update(); //aktualizacja pozycji
	myBackgroundMusic.play(); //odtwarzanie muzyki w tle
}


