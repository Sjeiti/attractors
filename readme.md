# ICS #

### Project setup

The project is an Angular application that uses Wordpress as a [REST API](https://wordpress.org/plugins/json-rest-api/) (also see [wp-api](http://wp-api.org/)).
For SEO we uses bare WP templates with injected JSON.

The simplified folder structure is as follows:

```
fonts/
js/
style/
wordpress/
	wp-admin/
	wp-content/
	wp-includes/
	.htaccess
.htaccess
ics.appcache
index.php
```

(although appcache is currently unused)

The Wordpress installation is not in root but in the folder 'wordpress'.
At root index.php is served which will load 'wordpress/wp-blog-header.php'.

The Wordpress output renders JSON in header.php so Angular can make an initial render without having to resort to additional Ajax calls. The Angular service 'HTTPProxy' checks whether an API call exists as script[type=application/json] and serves its contents.


### Build

A build distilles to the 'dist' folder (not in repo) using the build tasks `grunt dist` and `grunt distclean` (where the latter is the slowest because it cleans and builds everything).

Frontend vendor code is maintained through Bower, but the build script also checks `.bowerrc` for overrides.


### Icons

Icons are implemented through an iconfont created with Icomoon (http://icomoon.io/app). To add new icons add them to `/src/icons/ics.ai` and export them to svg. Then add the json file from `src/icons/ics.zip` to Icomoon to open the current fontset. Add the newly created svg icon and export the font. Overwrite `src/icons/ics.zip` with the exported zip and run `grunt icomoon` to update sass and font files.


### Plugin alterations

src\wordpress\wp-content\plugins\json-rest-api\class-wp-json-server.php::serve_request::ln184
serve as text/plain for IE9

src\wordpress\wp-content\plugins\wp-super-cache\wp-cache-base.php::ln4
commented CacheMeta class because it is unused and throws error when deployed


### Code notes

Since Google likes it so much loading of main css and js is deferred. See: `src\wordpress\wp-content\themes\ics\footer.php`.

Because it's a single page application the initial data is added as `script[type=application/json]`. See: `src\wordpress\wp-content\themes\ics\header.php` and `src\wordpress\wp-content\themes\ics\inc\ics_restapi.php`. This could be optimised by a deferred load instead of a JSON injection (mainly for `/wp-json/weetje`).

Templates are automatically injected into `src\js\run.js` through `grunt tpl`.

Custom events are handled through Signals (a pubsub implementation). See: `src\js\event.js`.

A number of sass variables are passed through to js by reading document.stylesheets. See bottom of `src\style\_variables.scss` and `src\js\controller\Ics.js::initCSS`.






<br/>

___

## Other stuff...

### Angular and SEO ###

http://stackoverflow.com/questions/13499040/how-do-search-engines-deal-with-angularjs-applications/23245379#23245379
https://www.google.com/webmasters/tools/googlebot-fetch
https://developers.google.com/speed/pagespeed/
https://developers.facebook.com/tools/debug/og/object/

### Deployment ###

#### dev ####

Develop
http://ics.develop.buildinamsterdam.com/

SFTP (Poort 22)
vps.buildinamsterdam.com
User: build
Password: build1n@msterdam

/home/build/sites/develop/ics.develop.buildinamsterdam.com

Database
Name: build_ics_develop
Server: localhost
username: build
password: build1n@msterdam

Staging
http://ics.staging.buildinamsterdam.com/

SFTP (Poort 22)
/home/build/sites/staging/ics.staging.buildinamsterdam.com

Database
Name: build_ics_staging

#### deployment ####

domain name staging  =    creditcard.staging.vellance.net (build:ics15bia)
domain name live     =    creditcard.clients.vellance.net, (www.)zekermetjecreditcard.nl
server ip            =    79.99.184.122
                       
ftp/ftps host        =    vm5022.vellance.net

username             =    creditcard
password             =    XANqriZjkipa     (Xray, Alfa, November, quebec, romeo, india, Zulu, juliet, kilo, india, papa, alfa)

#### staging ####

mysql host           =    localhost
database             =    icszeker_dev
collation            =    utf8_general_ci
phpmyadmin           =    https://vm5022.vellance.net/phpmyadmin

username             =    icszeker_dev_rw  (read write)
password             =    SeZe9ZfHciaB     (Sierra, echo, Zulu, echo, nine, Zulu, foxtrot, Hotel, charlie, india, alfa, Bravo)
username             =    icszeker_dev_ro  (read only)
password             =    tWWX0fAUezek     (tango, Whiskey, Whiskey, Xray, zero, foxtrot, Alfa, Uniform, echo, zulu, echo, kilo)

#### Live ####

mysql host           =    localhost
database             =    icszeker
collation            =    utf8_general_ci
phpmyadmin           =    https://vm5022.vellance.net/phpmyadmin

username             =    icszeker_rw      (read write)
password             =    oBGKA50C752u     (oscar, Bravo, Golf, Kilo, Alfa, five, zero, Charlie, seven, five, two, uniform)
username             =    icszeker_ro      (read only)
password             =    Bz9HdhLVsdb9     (Bravo, zulu, nine, Hotel, delta, hotel, Lima, Victor, sierra, delta, bravo, nine)