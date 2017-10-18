# Flask webpack Tutorial

How to easily develop flask-based python web applications that use (external) javascript
libraries? Adding direct links to your templates is a natural option but in the
long term, the maintenance is pretty overwhelming. Secondly, as in my case the
application might not work properly if deployed without internet or behind
a strict firewall. Lastly, javascript underwent a lots of changes in the recent
years and using the newest language features across all browsers, require
more complex toolchains (e.g. using of babel).

In this tutorial I will show a solution to that problem which uses `npm` (node package
manager) and `webpack` tool. The tutorial should give you basic understanding of the
tools rather than full deep dive into the aforementioned technologies.

Prerequisites:
* understanding of `Flask`, `Python`, and `javascript`
* availability of `npm`

## Project structure
Let us start with a simple directory structure for our application. We will create
separate directories for templates and static content as required by Flask. We also
add a directory to write our javascript code.
```
mkdir -p flaskpack/templates
mkdir -p flaskpack/static
mkdir -p flaskpack/src
```

## Simple Flask Application
I suggest to use virtual environment for programming with flask but this is not
strictly required. Anyways you can just cd in to the project directory and create
application code:
```
cd flaskpack
vi app.py
```

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
   return render_template('index.html')

if __name__ == "__main__":
   app.run()
```

As you see the application has just one entry point i.e. it reacts only on requests
on root url. In this case a template (`index.html`) is rendered and sent back to the user.
Now we have to create the template. Although it is possible to define the location of
the template directory we use the default flask option which seeks for templates in
`/template/` directory.

```bash
vim /template/index.html
```

```html
<html>
<body>
  <h1>Simple web app</h1>

  <script src="{{ url_for('static', filename='bundle.js') }}"></script>
</body>
</html>
```

There is not much happening here now. We have a simple web page with a heading.
We also include a javascript file `bundle.js` from static directory. This file should
incorporate additional logic of our application that we would like to outsource
to the client. The problem is that the file does not exist yet. You can start the
Flask application and it should work and serve all the static (i.e. not javascript-based)
to the user:
```
python app.py
```

and use browser to go to `localhost:5000` to see the result.

## Javascript part
Now we would like to extend our simple application with some javascript. To this
end we have to create and edit `src/my.js` file. Please note that we don't create
`bundle.js` now. This file will be created automatically later. Our javascript
will look like that.

```
vim /src/my.js
```

```javascript
import _ from 'lodash';

function component() {
   var element = document.createElement('div')
   element.innerHTML = _.join(['Hello','world','!!'], ' ');

   return element;
}

document.body.appendChild(component());
```

We use an external library (`lodash`) to dynamically generate additional content
of our page.

Let us assume that our coding ends here, and we would like to test and ship the
functionality. Two remaining problems are how to get the dependencies (i.e. `lodash`)
and generate `bundle.js` with our code required by the previously created template.

## Npm package manager

For managing the dependencies we will use `npm` (node package manager). Firstly, we
need to initialize the tool.

```shell
npm init -y
```

This will create a manifest file `package.json` and also a directory `node_modules`
where external libraries will be installed. At this point you can review the
`package.json` file and edit things like project name, version, or description.

The package manager can also install javascript libraries in the directory. We
will require `lodash` library. To install it we have to issue following command:

```shell
npm install lodash --save
```

The `--save` argument is required to add this dependency to the `package.json` file.
You can check it now to see that a new line was added:

```javascript
"dependencies": {
    "lodash": "^4.17.4"
  }
```

Although it would be possible to make the node_modules accessible to flask and thus
visible from its the templates, this is probably not the best solution. Instead
we will use `webpack` tool to manage the resources.

## Webpack

First we have to install `webpack`. It is important to notice that `webpack` is not
really required for our application to work (unlike `lodash`). The `npm` differentiate
between dependencies and devDependencies. The later are used to manage tools
required for development and deployment of the application but not during the
runtime of it. To install `webpack` use `npm` like:

```shell
npm install --save-dev webpack
```

Now you can run the `webpack` to finally create `bundle.js` file required by our
application, one way of doing this is to call `webpack` directly:

```shell
./node_modules/.bin/webpack src/my.js static/bundle.js
```

After this step a new file `bundle.js` should appear in the static directory of
your application and after starting Flask app again you should be able to see a webpage
with dynamically generated content.

A much more elegant way of working with `webpack` is to create a file called `webpack.config.js`
which will describe how the `bundle.js` is created. Let us do it now:

```shell
vi webpack.config.js
```

```javascript
const path = require('path');

module.exports = {
  entry: './src/my.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static')
  }
};
```

We can also extend `packages.json` to make the work with `webpack` easier. The `npm`
offers the possibility to define scripts, you have to add following line to your
project file:
```shell
vi packages.json
```

```javascript
"scripts": {
    "build": "webpack"
  },
```

Now we can generate new version of `bundle.js` by just issuing:

```shell
npm run build
```

For the development it is useful to use `webpack` function called watch. This
creates a process which reacts to changes in the javascript files and automatically
regenerates `bundle.js`. To use this feature add one more script to the `package.json` file
```shell
vim packages.json
```

```javascript
"scripts": {
  "build": "webpack",
  "watch": "webpack --watch"
},
```

you can start it now by:
```shell
npm run watch
```

## Links
<https://webpack.js.org/guides/>
<https://www.npmjs.com/>
