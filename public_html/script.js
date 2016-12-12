/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

var translation = {x:290, y:252};
var translation_speed = 1;

var mouse = {lclicked:false, lx: 0, ly :0};

var mouseDown = 0;

var scale = 0.000000005;
var r_scale_log = 0.3;
var r_scale_sqrt = 300000;

var delta_t = 500;

var planets = Array(1000);
var planets_lenght = 0;

function tr(x, y) //transformation
{
  x *= scale;
  y *= scale;
  x += translation.x;
  y += translation.y;
  return {x:x, y:y};
}

//function tr(vec)
//{
  //return tr(vec.x, vec.y);
//}

function mouse_clicked()
{
  return mouseDown !== 0;
}

function vector(x, y)
{
  return {x:x, y:y};
}

function planet(mass, x, y, vx, vy, r, name, css)
{
  return {mass:mass, position:vector(x, y), speed: vector(vx, vy), r:r, name:name, css:css};
}

var fps = 60;
var cps = 1000;

var kappa = 6.674*Math.pow(10,-11);

function vec_distance(v1, v2)
{
  return Math.sqrt((v1.x - v2.x)*(v1.x - v2.x)+(v1.y - v2.y)*(v1.y - v2.y));
}

function distance(p1, p2)
{
  return vec_distance(p1.position, p2.position);
}

function sign(a)
{
  if(a > 0)
    return 1;
  else if(a<0)
    return -1;
  return 0;
}

function acceleration(p1, p2)
{
  return vector(-kappa*p2.mass/distance(p1, p2)/distance(p1, p2)*Math.abs(Math.cos(Math.atan((p1.position.y - p2.position.y)/(p1.position.x-p2.position.x))))*sign(p1.position.x-p2.position.x)
  ,-kappa*p2.mass/distance(p1, p2)/distance(p1, p2)*Math.abs(Math.sin(Math.atan((p1.position.y - p2.position.y)/(p1.position.x-p2.position.x))))*sign(p1.position.y-p2.position.y));
}

$(function ()
{
  window.setTimeout(function () {
    document.getElementById('settings').style.visibility = 'visible';
  }, 600);
  
  
  
  document.body.onmousedown = function() { 
  mouseDown = 1;
  };
  document.body.onmouseup = function() {
    mouseDown = 0;
  };
  
 // $("#screen").onmousemove = translate;
  planets[0] = planet(6*Math.pow(10, 26), 1.496*Math.pow(10, 11), 0, 0, 30000, 6378000, "Earth", "earth");
  planets[1] = planet(2*Math.pow(10, 30), 0, 0, 0, 0, 7000000000, "Sun", "sun");
  //planets[2] = planet(6*Math.pow(10, 29), -1.196*Math.pow(10, 11)*1.3, 0, 0, 30000, 637800000, "Earth", "sun");
  
  planets[2] = planet(7*Math.pow(10, 22), 1.496*Math.pow(10, 11)*1.02, 0, 0, 34000, 1700000, "Moon", "moon");
  planets_lenght = 3;
  
  $('#time_multiplicator').val(delta_t*cps);
  $('#cps').val(cps);
  
  window.setTimeout(next_compute, 1000/cps);
  window.setTimeout(next_frame, 1000/fps);
}
);

function planet_size_log(r)
{
  return Math.log(r)*r_scale_log;
}

function planet_size_sqrt(r)
{
  return Math.sqrt(r)*r_scale_sqrt;
}

function _translate()
{
  var e = window.event;
  if(!mouse.lclicked && mouse_clicked())
  {
    mouse.lx = e.clientX;
    mouse.ly = e.clientY;
    mouse.lclicked = true;
    return;
  }
  if(mouse.lclicked && !mouse_clicked())
  {
    mouse.lclicked = false;
    return;
  }
  if(mouse.lclicked && mouse_clicked())
  {
    translation.x += translation_speed * (e.clientX - mouse.lx);
    translation.y += translation_speed * (e.clientY - mouse.ly);
    
    mouse.lx = e.clientX;
    mouse.ly = e.clientY;
    return;
  }
}

function info_update()
{
  $("#projection_out").html("Translation: " + translation.x + "; " + translation.y 
          + "</br> Scale: "+ scale);
  $("#Planets_out").html("v: " + planets[0].speed.x + "; " + planets[0].speed.y );
}

function update_planets()
{
  for(var i = 0; i !== planets_lenght; i++)
  {
    for(var ii = 0; ii !== planets_lenght; ii++)
    {
      if(i === ii)
        continue;
      planets[i].speed.x += delta_t * acceleration(planets[i], planets[ii]).x;
      planets[i].speed.y += delta_t * acceleration(planets[i], planets[ii]).y;
    }
    planets[i].position.x += planets[i].speed.x * delta_t;
    planets[i].position.y += planets[i].speed.y * delta_t;
  }
}


function draw_planets_basic()
{
  var gr = new jsGraphics(document.getElementById("screen"));
  gr.clear();
  var col = new jsColor("red");
  for(var i = 0; i !== planets_lenght; i++)
  {
    var point = new jsPoint(tr(planets[i].position.x, planets[i].position.y).x, tr(planets[i].position.x, planets[i].position.y).y);
    gr.fillCircle(col,point,planet_size_sqrt(planets[i].r)*scale);
  }
}

function draw_planets()
{
  var source = "";
  for(var i = 0; i !== planets_lenght; i++)
  {
    source += "<div class=\"" + planets[i].css + "\" style=\"left: ";
    source += (tr(planets[i].position.x, planets[i].position.y).x -planet_size_sqrt(planets[i].r)*scale) + "px; top: " + (tr(planets[i].position.x, planets[i].position.y).y -planet_size_sqrt(planets[i].r)*scale);
    source += "px; width: " + planet_size_sqrt(planets[i].r)*scale*2+ "px; height: " +planet_size_sqrt(planets[i].r)*scale*2;
    //source += "px; backgroud-size: " + planet_size_sqrt(planets[i].r)*scale*2;
    source +="px; \" id=\"" + planets[i].name + "\"> </div>";
  }
  $("#planets").html(source);
}

var do_next_frame = true;

function next_frame()
{
  
  do_next_frame = true;
  window.setTimeout(next_frame, 1000/fps);
}

function next_compute()
{
  update_planets();
  if(do_next_frame)
  {
    info_update();
    draw_planets();
    do_next_frame = false;
  }
  window.setTimeout(next_compute, 1000/cps);
  
}



function time_speed_change()
{
  if($('#time_multiplicator').val() == parseFloat($('#time_multiplicator').val()))
  {
    delta_t=parseFloat($('#time_multiplicator').val())/cps;
    return;
  }
  $('#time_multiplicator').val(delta_t*cps);
}

function cps_change()
{
  if($('#cps').val() == parseFloat($('#cps').val()))
  {
    delta_t=delta_t*cps;
    cps=parseFloat($('#cps').val());
    delta_t=delta_t/cps;
    return;
  }
  $('#cps').val(cps);
}

