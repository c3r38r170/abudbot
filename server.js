// server.js
// where your node app starts
// init project
const express = require("express");
const app = express();
// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  //response.sendFile(__dirname + "/views/index.html");
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

//bumping
const http = require('http');
//app.listen(process.env.PORT);
setInterval(() => {
  console.log('bumped')
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);

}, 60000);

////real bot
const fs = require('fs')
  ,dbFile = './.data/sqlite.db'
  ,exists = fs.existsSync(dbFile)
  ,sqlite3 = require('sqlite3').verbose()
  ,db = new sqlite3.Database(dbFile)
  ,ytdl = require('ytdl-core')
  ,youtube = new (require("discord-youtube-api"))(process.env.GOOGLE_API_KEY);
//config
const token=process.env.TOKEN;
const Discord=require('discord.js');
const client = new Discord.Client();
//vars
async function play(input,voiceChannel){
  const permissions = voiceChannel.permissionsFor(client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    console.log(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  const video=await youtube.searchVideos(input);
  if(!video){
    console.log('no video');
    return;
  }
  const songInfo = await ytdl.getInfo(video.url);
  voiceChannel.join().then(connection=>{
    connection
      .play(ytdl(songInfo.videoDetails.video_url,{filter:'audioonly'}))
      .on("error", error => console.error(error))
      //.setVolumeLogarithmic(1);
    setTimeout(()=>connection.disconnect(),15000);
  });
}
function playFromText(song,m){
  let mv=m.member.voice;
  if(mv)
    play(song,mv.channel);
  else console.log(m.member);
}
const actions=[
  [/^dame fuego$/i,m=>m.channel.send('dame dame fuego!')]
  ,[/^movete$/i,m=>m.channel.send('chiquita movete!')]
  ,[/^ping$/,m=>m.channel.send('pong!')]
  ,[/^pingo$/,m=>m.channel.send('pongo')]
  ,[/^bingo$/,m=>m.channel.send('bango!')]
  ,[/^\/grandote/,m=>playFromText('che grandote',m)]
  ,[/^\/ocean man/,m=>playFromText('ocean man',m)]
  ,[/^\/somebody/,m=>playFromText('smash mouth all star',m)]
  ,[/^\/set my intro .*/,m=>{
    let a=m.content.match(/(?:^\/set my intro )(.*)/)[1].trim();
    if(a && a.length<=255){
      db.get("SELECT id FROM Intros WHERE user='"+m.author.id+"'",function(err,res){
        let b,c;
        //a=a.replace(/,/g,' ');
        
        if(res){
          b='UPDATE Intros SET intro=? WHERE id='+res.id;
          c=[a];
        }else{
          b='INSERT INTO Intros (user,intro) VALUES (?,?)';
          c=[m.author.id,a];
        }
        let stmt=db.prepare(b);
        stmt.run(...c);
        stmt.finalize();
        m.channel.send('Seteado el leitmotiv a '+a);
      });
    }else m.channel.send('Ah sos gracioso.');
  }]
  ,[/^alldb$/,m=>{
    db.get("SELECT * FROM Intros",(err,res)=>{
      m.channel.send(JSON.stringify(err)+JSON.stringify(res));
    });
  }]
  ,[/^reset$/,m=>{
    db.run('DROP TABLE Intros',a=>console.log(a));
    db.run('CREATE TABLE Intros (id INTEGER PRIMARY KEY, user CHAR(18) NOT NULL, intro VARCHAR(255) NOT NULL)',a=>console.log(a));
  }]
];
//logic
client.on('ready',()=>{
  db.serialize(function(){
    if(!exists)
      db.run('CREATE TABLE IF NOT EXISTS Intros (id INTEGER PRIMARY KEY, user CHAR(18) NOT NULL, intro VARCHAR(255) NOT NULL)',a=>console.log(a));
  });
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message',msg=>{
  for(let a of actions)
    if(a[0].test(msg.content)){
      a[1](msg);
      break;
    }
});
client.on('voiceStateUpdate',(oldMember,newMember)=>{
  //if(newMember.user.bot)
    //return;
  
  let newUserChannel=newMember.voiceChannel
    ,oldUserChannel=oldMember.voiceChannel;
  if(oldUserChannel===undefined && newUserChannel!==undefined) {//both are the same user, the different variables are the different states after the voice state update
    db.get("SELECT intro FROM Intros WHERE user='"+newMember.id+"'",function(err,res){
      if(res){
        play(res.intro,newUserChannel); 
      }
    });
  }//else if(!oldUserChannel.members.size())
})
client.login(token)

//bumping comment