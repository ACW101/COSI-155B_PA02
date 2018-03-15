# Three.js Game - Team Seapunk

Due Tuesday 3/20/18 before midnight

You are to work with your team to modify the game0 demo from class and make the following changes:

- [x] Add key controls Q and E to rotate the avatar camera view to the left and right, respectively\
    Look at how we move the avatar camera forward and backward and up and down with arrow keys

- [x] Replace the box avatar with a Monkey avatar (but still use the Physijs.BoxMesh container for the Physics)\
See L11 about Loading objects

- [x] Create a NonPlayableCharacter which moves toward the avatar if the avatar gets too close (e.g. 20 meters away)\
You can use the lookAt method to have the NPC face the avatar

- [x] When the NPC hits the Avatar, the avatar should lose a point of health and the NPC should be teleported to a random position on the board\
see how we teleported the avatar with the "h" key

- [x] When the Avatar reaches zero health, the game should go to a You Lose scene, which the player can restart with the "r" key\
look at how we handle the "win" situation

- [x] Add a start screen, where the user can initiate play by hitting the P key

- Each member of the team should also add at least one additional feature to the game\ 
    - [x] Chuanxiong: add random balls pressing key "i",
    - [x] Jinli: add lose scene, add "dash" to avatar pressing key "j"
    - [x] Kevin: make camera rotate around the main scene in startScene
    - [x] Qiao: camera can be controlled by arrow keys and "t", "g"
    - [x] Yifu: adjust camera to resized window, replace NPC with a stormtrooper model

How to submit...
- [ ] make a 30 second movie demonstrating that your game meets the criteria (take a phone movie of someone playing it). You can upload several short movies if you want, one for each feature, but the total should be at most 30 seconds, and you should narrate the movies.
- [ ] create a page on your team site for PA02
- [ ] upload your movie to youtube or vimeo and add a link to it from your team page
- [ ] upload your game to github and add a link to it the github site to your PA02  team page
- [ ] upload a link to your PA02 team page to latte and also upload a reflection about what you individually did for the project
- [ ] You should also make your game playable on the github site (I'll show you how to do this on Wednesday)
