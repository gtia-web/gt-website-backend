# GTIA Website

<p align="center">
    <img src="./public/assets/sun/img/logo.png" alt="GTIA Logo" />
</p>

Live webiste - [gtia.gtorg.gatech.edu](https://gtia.gtorg.gatech.edu/)


## Installation Guide

### Pre-requisites
The following tools, software, and technologies are needed to run the application:
<ol>

<li> <b>Install Node.js</b>

  Node.js is a JavaScript runtime that allows us to run JavaScript code outside of browser. <br />
  For this project, please download 14.x LTS version from [here](https://nodejs.org/en/) and perform the installation.<br />
  To verify the installation, run the following command:

  ```
  $ node -v
    v14.16.1
  ```

  If successful, it should display the version number (eg: `v14.16.1` shown above). If there are errors performing installation, some helpful guides are listed below:

  - [Installing Node.js on Windows 10](https://stackoverflow.com/questions/27344045/installing-node-js-and-npm-on-windows-10)
  - [Installing Node.js on Mac](https://treehouse.github.io/installation-guides/mac/node-mac.html)

</li>


 <li> <b>Install npm (Node Package manager)</b>

 We are using `npm` to install and manage "packages" (dependencies). <br />
 Node.js installs NPM by default. To verify if NPM is already installed, run the following command:

 ```
$ npm -v
7.22.0
 ```
If successful, it should display the version (example above).

Make sure you are running npm version 7.x. To update npm, run the following command:
```
$ npm install -g npm@latest
```

 However, if `npm` is missing, download npm from [here](https://www.npmjs.com/get-npm) (this includes all the installation guide).

 </li>

<li> <b>MongoDB</b>

We are using `MongoDB` to store data for our backend features. <br />
If you do not have a MongoDB database, MongoDB provides a free cloud database service [here](https://www.mongodb.com/cloud/atlas/signup).

**Note:** This step is optional if you are only working on `Sun` components.

</li>

</ol>

<br />

### Download Instructions

The source code can be downloaded any one of the steps:

1. Cloning the repository

    To clone the repository using HTTPS, run the following command from the desired directory:
    ```
    $ git clone https://github.com/JIA-0302/TipTracker.git
    ```
    This will download all the source code from the repository.
    

2. Download the ZIP file from [here](https://github.com/JIA-0302/TipTracker/archive/refs/heads/main.zip)

<br />

### Installing Dependent Libraries

**NOTE:** Make sure you have Node.js and npm installed. See pre-requisites for installation instructions.

From the root directory of the project, run the following command:

```
$ npm install
```

All of the required dependent libraries are listed in `package.json` file. Running this command will automatically install all of these libraries. A new directory called `node_modules` will be created with all of these libraries.

<br />

### Environment Variables

To setup the environment variables

    - Create a new file `.env` in the root directory
    - Copy all the contents of `.env.example` into `.env`
    - Replace all the required fields (`xxxxxxx`) specific to your configurations.
    
    ```
    # These variables can be accessed in the app from `process.env.`
    # Example, to retreive DB CONNECTION Url, use `process.env.DB_CONNECTION`

    # MongDB connection string
    DB_CONNECTION=xxxxxxxx

    # Authentication
    SESSION_SECRET=xxxxxxxx

    # Facebook
    FB_APP_ID=xxxxxxxx
    FB_APP_SECRET=xxxxxxxx
    FB_PAGE_ACCESS_TOKEN=xxxxxxxx
    FB_PAGE_ID=xxxxxxxx

    # Configurations
    PORT=8080
    ```

Note, these variables can be set directly. However, by using `.env`, these variables are only available during the runtime of the application and are easier to manage.

The following environment variables are required for `Moon` component:
- `DB_CONNECTION`: This is used to specify connection string the to database.
- `SESSION_SECRET`: This is used to encrypt the session data for a user.
- **Facebook**: This is required to show upcoming/past events in the home page.
  - `FB_APP_ID`: This is used to specify the application to access the GTIA Facebook page on behalf of the admin.
  - `FB_APP_SECRET`: This is used to authenticate the application.
  - `FB_PAGE_ACCESS_TOKEN`: This is a long-term token used to access the GTIA Facebook page on behalf of the admin user. If new token needs to be generated, see instructions [here](./utility/facebookUtils.js).
  - `FB_PAGE_ID`: This is the ID for the GTIA Facebook page.

<br />

## Run Instructions
Run the following command from the root directory:
```
$ npm run start
```

This will start the application at http://localhost:8080 by default. Simply visit this URL on your browser to view the application.

If you want to use a different port, update it in `.env` file.

<br />

## Deployments
The website is currently deployed to and hosted from `hosting.gatech.edu`.

It uses Plesk Hosting on the backend. It maintains its own copy of the repo and deploys the website through that. To deploy new changes to the live website:
- Visit hosting.gatech.edu
- Click on `Plesk Web Admin` on the navbar. If you do not see this option, it means you do not have permissions to access the website hosting. Please talk to EVP to request permissions.
- Open `plesk21` for `gtia.gtorg.gatech.edu` under the `Plesk Control Panel`.
- Click `Pull Updates` for `gt-website-backend`.
- Restart the Node.js application
- The new changes should be live after the first request is made.

The hosting service has been setup to automatically restart the node application on new pull updates from the repo.
However, due to network policies, we cannot use the provided webhook to trigger automated pull updates :disappointed:.

Therefore, even after the changes are merged to the main branch, please follow the steps above to deploy the new changes to the live website.