'use strict'

var Project = require('../models/project');
var fs = require('fs');
var path = require('path');

var controller = {
	
	home: function(req, res){
		return res.status(200).send({
			message: 'I am Home'
		});
	},

	test: function(req, res){
		return res.status(200).send({
			message: "I am the controller project Method"
		});
	},

	saveProject: function(req, res){
		var project = new Project();

		var params = req.body;
		project.name = params.name;
		project.description = params.description;
		project.category = params.category;
		project.year = params.year;
		project.langs = params.langs;
		project.image = null;

		project.save((err, projectStored) => {
			if(err) return res.status(500).send({message: 'Error on project save'});

			if(!projectStored) return res.status(404).send({message: 'Project Not saved'});

			return res.status(200).send({project: projectStored});
		});
	},

	getProject: function(req, res){
		var projectId = req.params.id;

		if(projectId == null) return res.status(404).send({message: 'Project not found'});

		Project.findById(projectId, (err, project) => {

			if(err) return res.status(500).send({message: 'Error on data serving'});

			if(!project) return res.status(404).send({message: 'Project not found'});

			return res.status(200).send({
				project
			});

		});
	},

	getProjects: function(req, res){

		Project.find({}).sort('-year').exec((err, projects) => {

			if(err) return res.status(500).send({message: 'Error on data serving'});

			if(!projects) return res.status(404).send({message: 'No projects to show'});

			return res.status(200).send({projects});
		});

	},

	updateProject: function(req, res){
		var projectId = req.params.id;
		var update = req.body;

		Project.findByIdAndUpdate(projectId, update, {new:true}, (err, projectUpdated) => {
			if(err) return res.status(500).send({message: 'Error on update'});

			if(!projectUpdated) return res.status(404).send({message: 'Project not found to update'});

			return res.status(200).send({
				project: projectUpdated
			});
		});

	},

	deleteProject: function(req, res){
		var projectId = req.params.id;

		Project.findByIdAndRemove(projectId, (err, projectRemoved) => {
			if(err) return res.status(500).send({message: 'Project Not deleted'});

			if(!projectRemoved) return res.status(404).send({message: "Project not found to delete"});

			return res.status(200).send({
				project: projectRemoved
			});
		});
	},

	uploadImage: function(req, res){
		var projectId = req.params.id;
		var fileName = 'Image not uploaded...';

		if(req.files){
			var filePath = req.files.image.path;
			var fileSplit = filePath.split('\\');
			var fileName = fileSplit[1];
			var extSplit = fileName.split('\.');
			var fileExt = extSplit[1];

			if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){

				Project.findByIdAndUpdate(projectId, {image: fileName}, {new: true}, (err, projectUpdated) => {
					if(err) return res.status(500).send({message: 'Image not uploaded'});

					if(!projectUpdated) return res.status(404).send({message: 'Project does not exist to assign an image'});

					return res.status(200).send({
						project: projectUpdated
					});
				});

			}else{
				fs.unlink(filePath, (err) => {
					return res.status(200).send({message: 'Extension is not valid'});
				});
			}

		}else{
			return res.status(200).send({
				message: fileName
			});
		}

	},

	getImageFile: function(req, res){
		var file = req.params.image;
		var path_file = './uploads/'+file;

		fs.exists(path_file, (exists) => {
			if(exists){
				return res.sendFile(path.resolve(path_file));
			}else{
				return res.status(200).send({
					message: "Image does not exist"
				});
			}
		});
	}

};

module.exports = controller;