//*****************************Notes********************************** 
// Helper functions
// getBoundingClientRect() returns the size and position of an element relative to the viewport, useful for positioning elements dynamically or calculating collision detection.
// The offset property in CSS specifies the positioning offset of an element from its normal position in the document flow. It allows you to adjust an element's position relative to its containing element or its nearest positioned ancestor.
// ---------------------------------------------------------------------



let currentsong = new Audio() //Globally Declared
let songs; //Globally Declared
let currFolder; //Globally Declared


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// -------------------------------------------------------------------------------
//This function returns all the songs form our song directory
async function getSongs(folder) {
    currFolder = folder
    let response = await fetch(`/${folder}`)
    let data = await response.text()
    let parser = new DOMParser();
    let doc = parser.parseFromString(data, "text/html");
    // Select all 'li' elements within the '#files' element
    let as = doc.querySelectorAll("#files a");
    // Log all 'a' elements
    //  as.forEach(a => {
    //     console.log(a.outerHTML); // or process the element further
    // });
    // Create an array to store the hrefs of the songs
    songs = [];

    // Iterate over each 'a' element and check if the href ends with '.mp3'
    as.forEach(a => {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href.split(`/${folder}/`)[1]);
        }
    });

    //Show all the songs in the playlist
    let songUL = document.querySelector(".songslists").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear existing content

    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <div class="songcard">
                    <div class="flex">
                        <img src="https://plus.unsplash.com/premium_photo-1677589330393-e458a706f352?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="sfd">
                        <div class="text">
                            <h4>${song.replaceAll("%20", " ")}</h4>
                        </div>
                    </div>
                    <div class="play">
                        <p>Play Now</p>
                        <img src="UtilitySvg/play.svg" alt="">
                    </div>
                </div>
            </li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songslists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".text").firstElementChild.innerHTML.trim());
        });
    });
    // return the array of songs
    return songs
}
// -------------------------------------------------------------------------------

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "UtilitySvg/pause.svg";
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songduration").innerHTML = `00:00/${formatTime(currentsong.duration || 0)}`;
}

// ----------------------------------------------------------------------------------
async function displayAlbums() {
    // Fetch the content of the /songs/ directory
    let response = await fetch(`/songs/`);
    let data = await response.text();
    // console.log(data)

    // Parse the response HTML
    let parser = new DOMParser();
    let doc = parser.parseFromString(data, "text/html");
    console.log(doc);
    // let div= document.createElement("div")
    // div.innerHTML= doc
    // console.log(div)

    // Get all anchor elements within the parsed document
    let anchors = doc.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".albumcontainer")
    // console.log(anchors)


    // Array.from(anchors).forEach(async e => { !!!!!!!!!!}
    //Instead of using async , we have to use traditional for-loop here! Because we want to do it synchronously
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];




        // console.log(e.href)
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            console.log(e.href)
            // Extract the folder name from the href attribute
            let folder = e.href.split("/").slice(-1)[0]
            console.log(folder)

            //Get the metadata of the folder
            let metadata = await fetch(`/songs/${folder}/info.json`);
            console.log(metadata)
            let response = await metadata.json()
            console.log(response)

            // Create and append the card HTML
            cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="36px" height="36px" viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <!-- Circular green background -->
                            <circle cx="14" cy="14" r="14" fill="#00FF00" />
                            <g fill="#000000">
                                <title>play</title>
                                <desc>Created with Sketch Beta.</desc>
                                <!-- Correctly centered Play icon path -->
                                <path d="M21,14.5 L11,9 v11 l10 -5.5 z" fill="#000000" />
                            </g>
                        </svg>
                    </div>
                    <div class="container">
                        <img src="/songs/${folder}/cover.png" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
                </div>`;
        }
    }
    // Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            //Play the first song of the album whenever the album card is clicked anywhere
            playMusic(songs[0])
        })
    })


}




// ----------------------------------------------------------------------------------
async function main() {
    //Get the list of all songs.........
    await getSongs("songs/1bollywood_new");
    playMusic(songs[0], true)

    //Display all the albums on the page..........
    displayAlbums()



    //Attach an event listener to play, next and previous
    previous.addEventListener("click", () => {
        // Logic for previous song
    });

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "UtilitySvg/pause.svg";
        } else {
            currentsong.pause();
            play.src = "UtilitySvg/play.svg";
        }
    });

    next.addEventListener("click", () => {
        // Logic for next song
    });



    currentsong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentsong.currentTime);
        const duration = formatTime(currentsong.duration || 0);
        document.querySelector(".songduration").innerHTML = `${currentTime}/${duration}`;

        // Update the seekbar
        const seekbar = document.querySelector(".seekbar");
        const circle = document.querySelector(".circle");
        const progress = (currentsong.currentTime / currentsong.duration) * 100 + "%";
        circle.style.left = `${progress}`;
    });
    //Adding an event listener to the seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percentclicked = ((e.offsetX / e.target.getBoundingClientRect().width) * 100)
        document.querySelector(".circle").style.left = percentclicked + "%"
        //This line converts the percentclicked value to time duration at that value, lets assume the percentclicked value is 30% so it will simply take the real duration of the current song and will calculate what will be the duration at 30% , if the song duration is 40sec , its 30% will be 12sec and it will assing the value too the current time and the song will start playing at that duration!!!!!
        currentsong.currentTime = (percentclicked / 100) * currentsong.duration
    })

    //Adding an event listener for the hamburger!
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Adding an event listener for the cross button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //Adding event listener to Previous button
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //Adding event listener to Next button
    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])

        }
    })


    //Adding an event listener to Volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //The value of input range lies between 0 to 100 !!
        console.log("Setting volume to:", e.target.value);
        //The volume is a HTML Audio Object Properties which takes value between 0 to 1 so here we are making the input range's value in decimal by dividing it with 100 and the converting it to integer!!!
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //Adding an event listener to mute the track whenever clicked
    document.querySelector(".volumeimg > img").addEventListener("click", (e) => {
        // console.log(e.target);
        if(e.target.src.includes("volume.svg"))
        {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume=0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=0.1
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
        }
        //************************Important Note************************
        // As "Strings are immutable" so we have to use complete path while updating the string
    });
}

main();




