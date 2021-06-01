const express = require('express');
const app = express();

const http = require('https').createServer(app);

const io = require('socket.io')(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });


const peer = require('peer').ExpressPeerServer(http);

const uuidV4  = require('uuid');

app.use('/peer',peer);

app.use(require('cors')());

const mongoose = require('mongoose');
const {IDMANAGER} = require('./Model');


(()=>{
    mongoose.connect('mongodb+srv://admin:admin@cluster0.nn5p0.mongodb.net/vc?retryWrites=true&w=majority',{
        useUnifiedTopology:true,
        useNewUrlParser:true
    },(err)=>{
        if(err) console.log(err);
        else console.log('DATABASE CONNECTION STATUS OK');
    })
})();

app.get('/',async(req,res)=>{
    res.status(200).send({msg:"Server is running.."});
});

app.post('/create/:name',async(req,res)=>{
    let data =  IDMANAGER();
    const id = uuidV4.v4();
    data.id = id;
    data.title = req.params.name || null;
    console.log(data);
    await data.save();
    res.status(201).send({data});
});

app.get('/check/room/:id',async (req,res)=>{
    try {
        if(!req.params.id) res.status(404).send({msg:"Room deleted."});
        let data = await IDMANAGER.findOne({id:req.params.id});
        if(data) res.status(200).send({msg:"Room Exist"});
        else res.status(404).send({msg:"Room Deleted."});
    } catch (error) {
        res.status(403).send({msg:"Internal server error"});
    }
});

let user = 0;
io.on('connection',async(socket)=>{
    user++
    console.log(user)
    console.log('connected.');
    socket.on('join-room',(data)=>{
        let room = data.room;
        console.log(data);
        socket.join(room);
        socket.to(room).emit('user-connected',data);
        socket.on('disconnect',()=>{
            console.log('disconnected');
            user--
            console.log(user)
            socket.to(room).emit('user-disconnected',data.user)
        });
    });
    
    
});

http.listen(5001,(err)=>{
    if(err) console.log('Server error');
    console.log('server is started');
})

