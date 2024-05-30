const { Console } = require('console');
const { FORMERR } = require('dns');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);


let joueurs=[];
let codes=[];
let couleurs=[];

let tailleHex;
let hex=[];

let nbJoueurs;
let nbClients = 0;

let jeton=-1;

var recettes = [{'nom':'quatreQuarts', 'ingredients':['oeufs','farine','beurre','sucre']},
{'nom':'cake', 'ingredients':['farine','sucre','oeufs','lait']},
{'nom':'crepe', 'ingredients':['farine','oeufs','lait','beurre','sucre']}];

const readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



function plusAssezDeJoueur(){
    joueurs=[];
    codes=[];
    couleurs=[];
    tailleHex=undefined;
    hex=[];
    nbJoueurs = undefined;
    jeton=-1;
    io.emit("resetAttributs","");
}

function checkWin(idJoueur,caseActuel,bords,cases){

    let casesAutour = casesMemeCouleurAutours(idJoueur, cases[cases.length-1]);

    const containsAll = casesAutour.every(element => {
        return cases.includes(element);
      });
    
    if(bords.includes(caseActuel)){ // si la case ou je suis se trouve dans les bords a rejoindre je return true
        return true;
    }
    if(containsAll){ // si je suis déja passé par toutes les cases autour return false
        return false;
    }
    for (let i = 0; i < casesAutour.length; i++) {
        if(!cases.includes(casesAutour[i])){
            cases.push(casesAutour[i]);
            let truc = checkWin(idJoueur,casesAutour[i], bords, cases);
            if (truc){
                return true;
            }
        }
    }    
}

function findBorderToReach(caseDepart){
    let intNumCase = parseInt(caseDepart);
    let intTaille = parseInt(tailleHex);

    casesAAtteindre= [];

    if(intNumCase>=0 && intNumCase<=intTaille-1 ){  // si je suis a gauche
        for (let i = intTaille*intTaille-intTaille; i <= intTaille*intTaille-1; i++) {
            casesAAtteindre.push(i);
        }
        if(intNumCase == intTaille-1){
            for (let i = 0; i <= intTaille*intTaille-intTaille; i=i+intTaille) {
                casesAAtteindre.push(i);
            }
        }
    }
    if(intNumCase%intTaille==0 ){ // si je suis en haut
        for (let i = intTaille-1; i <= intTaille*intTaille-1; i=i+intTaille) {
            casesAAtteindre.push(i);
        }
        if(intNumCase == intTaille*intTaille-intTaille){
            for (let i = 0; i < intTaille; i++) {
                casesAAtteindre.push(i);
            }
        }
    }
    return casesAAtteindre;
}




function casesMemeCouleurAutours(id, numCase){
    let tabCasesMemeCouleur =[];
    let intTaille = parseInt(tailleHex);
    let intNumCase = parseInt(numCase);
    
    if(intNumCase==0){ // coin en haut gauche
        if(hex[1]== id){
            tabCasesMemeCouleur.push(1);
        }
        if(hex[intTaille] == id){
            tabCasesMemeCouleur.push(intTaille);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase==intTaille-1){ // coin en bas gauche
        if(hex[intNumCase-1] == id){
            tabCasesMemeCouleur.push(intNumCase-1);
        }
        if(hex[intNumCase+intTaille-1] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille-1);
        }
        if(hex[intNumCase+intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase==intTaille*intTaille-1){ // coin en bas droite
        if(hex[intNumCase-1] == id){
            tabCasesMemeCouleur.push(intNumCase-1);
        }
        if(hex[intNumCase-intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase-intTaille);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase==intTaille*intTaille-intTaille){ // coin en haut droite
        if(hex[intNumCase-intTaille] == id ){
            tabCasesMemeCouleur.push(intNumCase-intTaille);
        }
        if(hex[intNumCase+1] == id){
            tabCasesMemeCouleur.push(intNumCase+1);
        }
        if(hex[intNumCase-intTaille+1] == id ){
            tabCasesMemeCouleur.push(intNumCase-intTaille+1);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase<=intTaille-1){ // gauche
        if(hex[intNumCase-1] == id){
            tabCasesMemeCouleur.push(intNumCase-1);
        }
        if(hex[intNumCase+1] == id){
            tabCasesMemeCouleur.push(intNumCase+1);
        }
        if(hex[intNumCase+intTaille-1] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille-1);
        }
        if(hex[intNumCase+intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase%intTaille==0){ // en haut
        if(hex[intNumCase-intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase-intTaille);
        }
        if(hex[intNumCase-intTaille+1] == id){
            tabCasesMemeCouleur.push(intNumCase-intTaille+1);
        }
        if(hex[intNumCase+1] == id){
            tabCasesMemeCouleur.push(intNumCase+1);
        }
        if(hex[intNumCase+intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase%intTaille==intTaille-1){ // bas
        if(hex[intNumCase-intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase-intTaille);
        }
        if(hex[intNumCase+intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille);
        }
        if(hex[intNumCase-1] == id){
            tabCasesMemeCouleur.push(intNumCase-1);
        }
        if(hex[intNumCase+intTaille-1] == id){
            tabCasesMemeCouleur.push(intNumCase+intTaille-1);
        }
        return tabCasesMemeCouleur;
    }else if(intNumCase>=intTaille*intTaille-intTaille){ // droite
        if(hex[intNumCase-1] == id){
            tabCasesMemeCouleur.push(intNumCase-1);
        }
        if(hex[intNumCase+1] == id){
            tabCasesMemeCouleur.push(intNumCase+1);
        }
        if(hex[intNumCase-intTaille+1] == id){
            tabCasesMemeCouleur.push(intNumCase-intTaille+1);
        }
        if(hex[intNumCase-intTaille] == id){
            tabCasesMemeCouleur.push(intNumCase-intTaille);
        }
        return tabCasesMemeCouleur;
    }
    else { // au milieu
        if(hex[intNumCase-intTaille] !== undefined && hex[intNumCase-intTaille]== id){
            tabCasesMemeCouleur.push((intNumCase-intTaille));
        }
        if(hex[intNumCase-intTaille+1] !== undefined && hex[intNumCase-intTaille+1]== id){
            tabCasesMemeCouleur.push((intNumCase-intTaille+1));
        }
        if(hex[intNumCase-1] !== undefined && hex[intNumCase-1]== id){
            tabCasesMemeCouleur.push((intNumCase-1));
        }
        if(hex[intNumCase+1] !== undefined && hex[intNumCase+1]== id){
            tabCasesMemeCouleur.push((intNumCase+1));
        }
        if(hex[intNumCase+intTaille] !== undefined && hex[intNumCase+intTaille]== id){
            tabCasesMemeCouleur.push((intNumCase+intTaille));
        }
        if(hex[intNumCase+intTaille-1] !== undefined && hex[intNumCase+intTaille-1]== id){
            tabCasesMemeCouleur.push((intNumCase+intTaille-1));
        }
    }
    return tabCasesMemeCouleur;
}



rl.on('close', function () {
    console.log('\nPartie terminé');
    process.exit(0);
});

app.get('/', (request, response) => {
    response.sendFile('clientHex.html', {root: __dirname});
});


server.listen(8888, () => { console.log('Le serveur écoute sur le port 8888'); });

app.use(express.static('public'));


io.on('connection', (socket) => {
    // envoi d'un message au client

    nbClients++;
    socket.emit("num",{nb:nbClients, joueurs:joueurs});

    socket.on('disconnect', (data) => {
        if(nbClients>0){
            nbClients--;
        }
        io.emit('deconnexionClient', {joueurs:joueurs});
    });

    socket.on('message', (msg) => {
        io.emit("message", msg);
    });

    socket.on('joueurCo', data => {
        io.emit('joueurCo',{j: joueurs, c:couleurs});
    });

    socket.on('nbClientCo', data => {
        io.emit('nbClientCo',nbClients);
    });

    socket.on('creerPartie', (data) => {
        nbJoueurs = data.nbJoueur;
        tailleHex = data.tailleDamier;
        joueurs.push(data.nom);
        couleurs.push(data.couleur);
        if(data.code.length != 0){
            codes.push(data.code.toString());
        }else {
            //creer un code secret
            let code = Math.floor(Math.random()*(3000-1000))+1000;
            codes.push(code.toString());
            data["code"] = code;
            //envoie du code au createur de la partie pour l'afficher sur la page
            
        }
        data["num"] = joueurs.indexOf(data.nom);
        for(let i=0;i<tailleHex*tailleHex;i++){
            hex[i]=-1;
        }
        socket.emit("connexion", data);
        io.emit("creerPartie","ok");
    });

    // ////////////////// CHECK COULEUR (SI YA PAS UN MEC QUI A LA MEME COULEUR) /////////////////////////////////
    socket.on('rejoinPartie', (data) =>{
        data["tailleDamier"] = tailleHex;
        let tabIndexsCode = [];
        for (let i = 0; i < codes.length; i++) {
            codes[i] != data.code;
            tabIndexsCode.push(i);
        }
        if(joueurs.includes(data.nom) &&  codes[joueurs.indexOf(data.nom)] != data.code){
            socket.emit("failedCo","mauvais code pour se reconnecter");
            return;
        }
        if(couleurs.includes(data.couleur)){
            socket.emit("failedCo","couleur déjà selectionné");
            return;
        }
        // si un code est rentré
        if(data.code.length != 0){
            //check si c'est dans la liste des codes et le nom dans liste des joueurs au meme index alors ok
            if(codes.includes(data.code) && joueurs.includes(data.nom) && tabIndexsCode.includes(joueurs.indexOf(data.nom))){
                let index = joueurs.indexOf(data.nom);
                //couleurs[index] = data.couleur;
                data["couleur"] = couleurs[index];
                data["num"] = index;
                socket.emit("connexion",data);
                return;
            }else {
                if(joueurs.length<nbJoueurs){ // si reste de la place on ajoute le joueur
                    codes.push(data.code.toString());
                    joueurs.push(data.nom);
                    couleurs.push(data.couleur);
                    data["num"] = joueurs.indexOf(data.nom);
                    socket.emit("connexion",data);
                    socket.emit("creerDamier",tailleHex);
                    return;
                }
            }
            // si new code et nb joueurs < nb de joueurs max alors on l'ajoute + connecte
        }else{
            //si trop de joueurs co 
            if(joueurs.length>=nbJoueurs){
                socket.emit("failedCo","Trop de joueurs");
                return;
            }else { // sinon ajoute joueurs
                let code = Math.floor(Math.random()*(3000-1000))+1000
                codes.push(code.toString());
                joueurs.push(data.nom);
                couleurs.push(data.couleur);
                data["num"] = joueurs.indexOf(data.nom);
                data["code"] = code;
                socket.emit("connexion",data);
                return;
            }
        }
    });

    socket.on('supprimerJoueur', data => {
        let index = joueurs.indexOf(data.nom);
        joueurs.splice(index,1);
        codes.splice(index,1);
        couleurs.splice(index,1);
        for(let i=0;i<tailleHex*tailleHex;i++){
            if(hex[i] == index){
                hex[i]=-1;
            }else if (hex[i] > index){
                hex[i]--;
            }
        }   
        if(index < jeton){
            jeton-- 
        }
        if(joueurs.length<2){
            //faire des truc quand y'a plus assez de joueurs, peut etre redemarrer une partie ?
            plusAssezDeJoueur();
            return;
        }
        io.emit('supprimerJoueur', index);
        io.emit("demandePionJoue",{hex: hex,couleurs: couleurs});
        //faire fonction pour enlever les points du gars +
    });

    socket.on('demandePionJoue', function(){
        socket.emit('demandePionJoue',{hex: hex,couleurs: couleurs});
    });

    socket.on('pion', data => {
        if(jeton==-1) // = partie pas commencé
        {
            jeton=0;
        }
        //check if assez de joueurs present peut etre ? que il y a bien 4/4 mecs pour continuer de jouer ?
        if ( data.num == jeton) {
            if ( data.case >= 0 && data.case < tailleHex*tailleHex){
                if ( hex [data.case] == -1) { // si hexagone pas colorié
                    hex [data.case] = jeton;
                    dernierpion = data.case ;
                    let intTaille = parseInt(tailleHex);
                    for (let i = 0; i < intTaille; i++) { // 
                        if(hex[i] == jeton){
                            let bords = findBorderToReach(i);
                            if(checkWin(jeton,i,bords,[i])){
                                io.emit("message", joueurs[jeton]+" a gagné la partie");
                                io.emit('pion', {numCase: data.case, couleurPose: couleurs[data.num]});
                                io.emit("PartieTermine", joueurs[jeton]);
                                jeton =-2;
                                return;
                            }
                        }
                    }
                    for (let i = 0; i <= intTaille*intTaille-intTaille; i=i+intTaille) {
                        if(hex[i] == jeton){
                            let bords = findBorderToReach(i);
                            if(checkWin(jeton,i,bords,[i])){
                                io.emit("message", joueurs[jeton]+" a gagné la partie");
                                io.emit('pion', {numCase: data.case, couleurPose: couleurs[data.num]});
                                io.emit("PartieTermine", joueurs[jeton]);
                                jeton =-2;
                                return;
                            }
                        }
                    }
                    jeton ++; if (jeton == nbJoueurs) jeton = 0;
                    io.emit('pion', {numCase: data.case, couleurPose: couleurs[data.num]});
                }
            }
        }
    });

    socket.on("restartGame", data=>{
        joueurs=[];
        codes=[];
        couleurs=[];
        tailleHex=undefined;
        hex=[];
        nbJoueurs = undefined;
        jeton=-1;
        io.emit("resetAttributs","");
    });


});
