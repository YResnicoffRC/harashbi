import Metalsmith from "metalsmith";
import markdown from "metalsmith-markdown";
import layouts from "metalsmith-layouts";
import assets from "metalsmith-assets";
import permalinks from "metalsmith-permalinks";
import prismic from "metalsmith-prismic";
import metalsmithInPlace from "metalsmith-in-place";
var helpers = require("handlebars-helpers")();
var sitemap = require('metalsmith-mapsite');

import paths from "../paths";
import { DebugPlugin, StatisticsPlugin } from "./metalsmith-helpers";

const __PROD__ = process.env.NODE_ENV === "production";

export default new Metalsmith(paths.projectRoot)
  .clean(__PROD__)
  // .clean(true)
  .source(paths.metalsmithSource)
  .destination(paths.metalsmithDestination)
  .use(
    prismic({
      url: "https://rebshimon.cdn.prismic.io/api"
    })
  )
  .use(
    metalsmithInPlace()
  )
  .use(
    permalinks({
      relative: false
    })
  )
  .use(
    layouts({
      engine: "handlebars",
      default: "default.hbs",
      directory: "src/layouts/layout-templates",
      partials: "src/layouts/partials",
      partialExtension: ".hbs",
      helpers: {
        helpers: helpers
      },
      remane: true
    })
  )
  .use(sitemap({
    omitExtension: true,
    omitIndex: true,
    hostname: 'https://'
  }))
  .use(
    assets({
      source: "./src/assets",
      destination: "./assets"
    })
  )
  .use(
    assets({
      source: "./src/redirects",
      destination: "./"
    })
  )