# Knowledge About Going Live
Going live should be as painless as possible; however, as is the case
with many complex systems, things can go wrong.  This document
attempts to mediate knowledge transfer among team members so that
going live is smoother.

## How The System Deploys
Plottr web deploys an environment when the branch corresponding to
that environment is updated on Github.  Vercel deploys and manages
deployments.  It tracks the `main` branch to determine what to deploy
to [production](https://app.plottr.com), and it tracks the `staging`
branch for the [alpha/beta website](https://plottr-web-alpha.vercel.app).

Vercel deploys a branch the moment that it detects an update (usually
within seconds) so be careful about pushing/merging to these
branches.  i.e. only merge or push when you intend for a deployment to
go ahead.

You can track the progress of all deployments
[here](https://vercel.com/plottr/plottr-web).

## Integrations

### Firebase
The Firebase integration for Plottr is segmented into three
environments.  The first is a suite of emulators that are intended for
local development.  The second is an environment intended for testing
and development and is called `plottr-ci`.  The third is intended for
end users and is called `plottr`.

#### Emulators
The emulators are started with the command `yarn start-emulators` and
one can populate the emulator database and authentication system with
basic data using the command `yarn seed-firestore`.  The latter
command requires that you have a valid firebase token in the
environment variable `FIREBASE_KEY`.  To use this environment simply
run `yarn dev` with the `NODE_ENV` and `NEXT_PUBLIC_NODE_ENV`
variables unset or set to `development`.

#### Plottr-CI
Plottr-CI is a Firebase project.  Plottr uses Firebase Authentication,
Firestore, and Firebase Storage.  The latter two require that rules
are kept in sync with the `staging` branch of Plottr's git repository.
The rules can be found in `storage.rules` and `firestore.rules`.

The Firebase website for Plottr-CI is
[here](https://console.firebase.google.com/project/plottr-ci/overview).

#### Plottr (Production)
This integration is identical to Plottr CI, except that it's rules
should be kept in sync with the `main` branch of the Plottr git
repository.

The Firebase website for Plottr-CI is
[here](https://console.firebase.google.com/project/plottr/overview).

#### Firebase Storage and CORS
Firebase Storage disables CORS by default.  Plottr requires that this
be disabled.  Here's a guide on how to disable CORS:
https://blog.fireacademy.io/firebase-storage-cors-error-how-to-fix-it/

In short, you need to log on to Google cloud, open a console, create a
rules file with the following contents:

```json
[
    {
        "origin": ["*"],
        "method": ["GET"],
        "maxAgeSeconds": 3600
    }
]
```

and run the following command to enact those rules: `gsutil cors set
cors.json [YOUR_BUCKET_URL]`

### Environment Variables
The following environment variables are required by Plottr:

 - `DEPLOYMENT_ENV` -- one of `development`, `preview` or
   `production`.
 - `EDD_KEY` -- a secret key for accessing the EDD API that tracks
   subscriptions and purchases.
 - `EDD_TOKEN` -- a token for making requests to the EDD API that
   tracks subscriptions and purchases.
 - `FIREBASE_ENV` -- like `NODE_ENV` but can be separate for the
   purposes of testing against a different Firebase environment.
 - `FIREBASE_KEY` -- a key to connect to Firebase.  See the relevant
   project's Firebase console.
 - `LOGTAIL_SOURCE_TOKEN` -- a token that Logtail automatically sets
   up on Vercel and connects Logtail to Plottr.
 - `NEXT_PUBLIC_FIREBASE_ENV` -- client-side version of `FIREBASE_ENV`
 - `NEXT_PUBLIC_FIREBASE_KEY` -- client-side version of `FIREBASE_KEY`
   (Firebase keys aren't like ordinary keys and are safer to share
   because they're restricted to domains and don't grant access to
   read or modify data.)
 - `NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN`-- client-side version of
   `LOGTAIL_SOURCE_TOKEN`.
 - `NEXT_PUBLIC_NODE_ENV` -- client-side version of `NODE_ENV`.
 - `NEXT_PUBLIC_ROBOT` -- (deprecated) was used for a check to
   prohibit robots from scraping the site.
 - `NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN` -- A token for connecting the
   client to Rollbar.  Note that Rollbar has two distinct tokens --
   one for clients and another for servers.
 - `ROLLBAR_ACCESS_TOKEN` -- server-side version of
   `NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN`.  Note that Rollbar has two
   different tokens.  One for the client and the other for servers.

All environment variables with a prefix of `NEXT_PUBLIC` are available
on the public website.  Be careful what variables you prefix in this
way.  No sensitive data should be stored in such variables.

### Rollbar
Plottr integrates with a single Rollbar environment that's available
[here](https://rollbar.com/FictionalDevices/).  We use Rollbar to log
and track errors and report the errors to the `#dev-error_reports`
channel on Slack.

Be sure to set up the two _distinct_ client and server environment
variables for Rollbar to integrate correctly.  Check the web console
for errors after deploying if any changes were made to the
integration.

#### Source Maps
Source maps are only available for the desktop version so the stack
traces aren't very helpful for web yet.  There is a plugin for Webpack
that automates the process of uploading source maps but it hasn't yet
been integrated.

### LogTail
Plottr integrates with a single Logtail environment that's available
[here](https://logtail.com/team/51206/tail).

Logs should be available from `preview` branches (i.e. those made from
pull requests on Github) so you can test whether the integration is
working by watching the logs while using your preview site.

### Mixpanel
Plottr submits user telemetry data to Mix Panel to get a better
understanding of how our app is used.  The configuration is hard coded
into the website and Desktop.

Find the dashboard [here](https://mixpanel.com/project/950381/view/2658819/app/dashboards#id=91073).

### Beamer
We deliver news about updates etc. to our users using Beamer.  The
configuration is also hard coded and the environment is shared between
production and other environments.  Find the Beamer website
(here)[https://www.getbeamer.com/].
