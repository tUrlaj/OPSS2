var KontenerGry;
var MalyProblem;
var myBackground;

function RozpoczecieGry() 
{
	KontenerGry = new component(128, 128, "img/char.gif", 50, 240, "image");
	myBackground = new component(1280, 1000, "img/bg.jpg", 0, 0, "image");
	MalyProblem = new component(10, 200, "black", 300, 120); //utworzenie przeszkody
    ArenaRozgrywki.start();
}
var ArenaRozgrywki = 
{
    canvas : document.createElement("canvas"),
    start : function() 
	{
        this.canvas.width = window.innerWidth; //dostosowanie do fullscreen
        this.canvas.height = window.innerHeight; //dostosowanie do fullscreen
        this.context = this.canvas.getContext("2d");
		//this.canvas.style.backgroundImage = "url('img/bg.jpg')";
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(AktualizacjaArenyRozgrywki, 20);
        window.addEventListener('keydown', function (e) 
		{
            ArenaRozgrywki.key = e.keyCode;
        })
		window.addEventListener('keyup', function (e) 
		{
            ArenaRozgrywki.key = false;
        })
    }, 
	stop : function() 
	{
        clearInterval(this.interval);
    },    
    clear : function()
	{
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
//tworzenie elementów gry
function component(width, height, color, x, y, type) 
{
    this.type = type;
	if (type == "image") 
	{
		this.image = new Image();
		this.image.src = color;
	}
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.speedX = 0;
    this.speedY = 0;    
    this.gravity = 0.1;
    this.gravitySpeed = 0.1;
	this.update = function() {
        ctx = ArenaRozgrywki.context;
        if (type == "image") {
            ctx.drawImage(this.image, 
                this.x, 
                this.y,
                this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
		}
    this.newPos = function() 
	{
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.WcisnijKlawisz();
    }
    this.WcisnijKlawisz = function() 
	{
        var dno = ArenaRozgrywki.canvas.height - this.height;
        if (this.y > dno) 
		{
            this.y = dno;
            this.gravitySpeed = 0;
        }
    }
}
function AktualizacjaArenyRozgrywki() 
{
    ArenaRozgrywki.clear();
	MalyProblem.update();
	KontenerGry.speedX = 0;
    KontenerGry.speedY = 0; 
    if (ArenaRozgrywki.key && ArenaRozgrywki.key == 32) {KontenerGry.speedY = -3.5; } //sterowanie za pomocą spacji
	myBackground.newPos(); 
    myBackground.update();
    KontenerGry.newPos();
    KontenerGry.update();
}