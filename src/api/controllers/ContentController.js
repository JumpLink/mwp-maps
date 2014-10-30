/**
 * ContentController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {


  // example: function (req, res, next) {
  //   TemplateService.example(function(error, result) {
  //     Content.createEach(result, function (error, result) {
  //       if(error)
  //         next(error);
  //       else
  //         res.json(result);
  //     });
  //   });
  // }

  // find: function (req, res, next) {
  //   var name = req.param('name') ? req.param('name') : req.param('id');
  //   // console.log(name);
  //   Content.find({name:name}).exec(function found(err, result) {
  //     // console.log(err);
  //     // console.log(result);
  //     if(typeof result === 'undefined')
  //       return res.notFound();
  //     return res.json(result);
  //   });
  // }


  // , create: function (req, res, next) {
  //   var name = req.param('name');
  //   var data = req.params.all();
  //   Content.create(data).exec(function created (err, data) {

  //   });
  // }


  // warn this creates each time a new id
  replace: function (req, res, next) {
    ModelService.updateOrCreate('Content', 'name', req, res, next)
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}


};
