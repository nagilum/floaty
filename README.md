# floaty

Simple JS frontend route and template framework

## Register template

Register a template by getting the content from an already existing place in the HTML.

```js
floaty.template('frontpage', 'template#frontpage');
```

Register a template by directly supplying the HTML.

```js
floaty.template('frontpage', '<h1>Frontpage</h1>');
```

Register a template by requestint a file.

```js
floaty.template('frontpage', '/partials/frontpage.html');
```

## Rendering a template

Render a template by giving the name it was registered as, the selector where to put the content, and an optional set of values to replace inside the template.

```js
floaty.render('frontpage', 'article#content');
```

```js
floaty.render('frontpage', 'article#content', { name: 'Mr. Awesome' });
```

This will replace ```{{ name }}``` with ```Mr. Awesome``` in the HTML before applying it to the ```article#content``` selector.

## Registering routes

The routes register function have a minimum of 2 arguments, the path and callback. You can supply as many middleware functions as you like.

```js
floaty.route('/', viewFrontpage);
```

You can also use parameters which will be included in the context sent to the middlewares and callback.

```js
floaty.route('/user/:id/edit', isUserLoggedIn, editUser);
```

This will execute the ```isUserLoggedIn``` function first, then the ```editUser``` one, with a context containing the route object as well as a params which in this case looks like this: ```{ "id": 1 }``` for the URL ```/user/1/edit```.

## Handling routes not found

If a path is navigated to and a route for that path is not defined, the ```notFound``` callback is called if set.

```js
floaty.notFound(handleNotFoundRequests);
```

## Initializing the engine

After you have setup all routes and templates, run the ```init``` function to intercept all ```<a>``` clicks as well as render the template for the given browser location.

```js
floaty.init();
```

You can also supply options to the init function.

```js
floaty.init({
	// This will make the framework not
	// terminate the route if an exception
	// is thrown in one of the middleware
	// functions.
	continueOnExceptions: true
});
```