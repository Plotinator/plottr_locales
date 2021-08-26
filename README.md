# Plottr Web

This repository contains the source code for Plottr Web.  The web
version of the Plottr app.

# Running Locally

There are a few steps to start the project locally.

## Step One (Emulate Firebase)

The first is to start the emulators.  See [the section on
emulators](Starting and Seeding the Firebase Emulators) for details
about the emulating Firebase locally.

## Step Two (Run Plottr on a Different Host Name)

The second step is to run Plottr on a different host name.  If you try
to access Plottr via `http://localhost:3000` (as the development
server suggests) then our CORS calls will fail because of security
restrictions and you'll not be able to get very far with your
development.  The solution to this problem is to create an alias for
`localhost` in your `hosts` file.  To create an alias, first open up
the hosts file with super user permissions:

```bash
sude nano /etc/hosts
```

Then add an alias for local host by adding the line: 

```
127.0.0.1	plottr.local
```

My hosts file looks like this after I edited it:

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1	plottr.local
127.0.0.1	localhost
255.255.255.255	broadcasthost
::1             localhost
```

Once you've made this modification, you'll be able to access Plottr
locally using the following URL: `http://plottr.local:3000`.

# Starting and Seeding the Firebase Emulators

This project uses `Firebase`'s `Authentication` and `Firestore`.  You
can develop against local emulators of those services.  To do so, run
the following commands:

```bash
  yarn start-emulators
```

and when that's finished starting up (note that it lists ports for
admin UIs) you can run the next command to seed the database and
create a test user:

```bash
  yarn seed-firestore
```

# `Pltr` Library

The core feature set of `Plottr` is modelled using actions, reducers
and selectors. It depends on `redux` to model state coherently and
uses several pieces of middleware to augment the data store with
features such as histories and undo.

All of this logic is intended to be housed in the `pltr` library. You
can find a sub tree of this repository, containing the `pltr` library,
in `/lib/pltr`.

## First Time Usage of `Pltr`

Before you get developing in this repository, be sure to set up
`pltr`'s repository as a remote to make it easier to work with the
subtree.

Use the following command to add `pltr` as a remote:

```bash
    git remote add -f pltr git@github.com:Plotinator/pltr.git
```

navigate to lib/pltr and install packages with `npm install`
(and don't forget to navigate back to the root)

## Developing With the `Pltr` Subtree

To develop the project and then downstream your changes back to
`pltr`, you should develop as though `pltr` is part of this
repository. There is no need to split commits or treat `pltr`
specially in any way, until you want to do one of two things:

1. Push your changes to `pltr` to it's repository.
2. Pull the changes made to `pltr` in it's repository into this
   repository.

To do 1. run the following command:

```bash
    git subtree push --prefix=lib/pltr/ pltr <your-branch-name-here>
```

To do 2. run the following command:

```bash
    git subtree pull --prefix lib/pltr pltr master --squash
```

## Embedding `Pltr` (Do Not Run)

This section is here to document the process which resulted in `pltr`
embedded as a subtree in this repository.

The following command embeds `pltr` into the current repository at a
path of `/lib`.

```bash
    git subtree add --prefix lib/pltr pltr master --squash
```

# The `plottr_components` Library

The [component library repo](https://github.com/Plotinator/plottr_components) is the new home of our components! :)
This branch adds `plottr_components` as a `git sub-tree` in the `/lib` folder.

## Working With the Library

You change the `plottr_components` library the same way you would work with `plottr_locales` or `pltr`.
i.e. develop `plottr_electron` as though it doesn't contain any subtrees, and push the changes to Github using the subtree commands in the [Readme](https://github.com/cameronsutter/plottr_electron#readme).

## Working Out-Of-Tree

You can also work on the components out-of-tree (i.e. checked out to a folder other than `plottr_electron/lib`) as long as the other Plottr libraries are checked out as sibling folders of this library.
i.e. you can checkout `pltr`, `plottr_locales` and `plottr_components` to an arbitrary folder on your computer and work with them like they're individual git repositories.

## Storybook

The component library comes with Storybook installed and configured.
Storybook helps you develop components in isolation of the rest of the application to be more sure that the components work in isolation.
The idea here is that if it works and looks good in Storybook, then it's the application's job to replicate how it looks and behaves in Storybook.

### Starting the Watch-Compiler for Components

You need to start a watcher process for the component library as well as the `plottr_electron` app if you're making changes to components.
To start the component library watch compiler, run the following commands from the root of the repository:

```bash
  cd lib/plottr_components
  npm run start
```

The compiler doesn't use webpack and doesn't minify anything.
It simply runs the Sass compiler and babel directly.
It's intended to be a light-weight process which reflects changes quickly, aids in debugging and doesn't place more burden on your system.

### Starting Storybook

While you make changes to components it's recommended that you start up Storybook to watch how the components look in isolation from `plottr_electron`.
You can start the storybook by running the following commands from the root of the repository:

```bash
  cd lib/plottr_components
  npm run storybook
```

The storybook will open in a new tab and changes that you make to components will reflect via Webpack's Hot Module Reloading (HMR) -- i.e. they'll reflect pretty quickly and without refreshing the page.

# NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
