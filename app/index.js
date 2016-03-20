'use strict';

const path = require('path');
const generators = require('yeoman-generator');
const dottie = require('dottie');
const gitConfigParser = require('git-config');
const _ = require('lodash');
const gitRemoteOriginUrl = require('git-remote-origin-url');

module.exports = generators.Base.extend({
  prompting: function () {
    const done = this.async();
    gitRemoteOriginUrl().then(gitUrl => {
      const gitConfig = gitConfigParser.sync();
      console.log(gitConfig);
      this.prompt([{
	name: 'author.name',
	message: 'Author name',
	default: _.get(gitConfig, 'user.name')
      }, {
	name: 'author.email',
	message: 'Author email',
	default: _.get(gitConfig, 'user.email')
      }, {
	name: 'module.name',
	message: 'npm module name',
	default: process.cwd().split(path.sep).pop()
      }, {
	name: 'module.version',
	message: 'Module version',
	default: '1.0.0'
      }, {
	name: 'module.description',
	message: 'Module description'
      }, {
	type: 'list',
	choices: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-northeast-1'],
	name: 'aws.region',
	required: true,
	message: 'AWS Region'
      }, {
	name: 'aws.role',
	required: true,
	message: 'AWS Role ARN'
      }, {
	name: 'lambda.functionName',
	required: true,
	message: 'Lambda function name',
	default: process.cwd().split(path.sep).pop()
      }, {
	type: 'list',
	required: true,
	choices: [
	  '128', '192', '256', '320', '384', '448', '512',
	  '576', '640', '704', '768', '832', '896', '960', '1024',
	  '1088', '1152', '1216', '1280', '1344', '1408', '1472', '1536'
	],
	name: 'lambda.memorySize',
	message: 'Lambda allocated memory size'
      }, {
	name: 'lambda.timeout',
	required: true,
	message: 'Lambda timeout',
	default: '3'
      }, {
	name: 'git.url',
	message: 'Git url',
	default: gitUrl
      }], answers => {
	const settings = dottie.transform(answers);
	this.config.set('author', settings.author);
	this.config.set('module', settings.module);
	this.config.set('aws', settings.aws);
	this.config.set('lambda', settings.lambda);
	this.config.set('git', settings.git);
	done();
      });
      
    });
  },
  default: {
    licence: function () {
      this.composeWith('license', {
	options: {
	  name: this.config.get('author').name,
	  email: this.config.get('author').email
	}
      }, {
	local: require.resolve('generator-license/app')
      })
    }
  },
  writing: function () {
    this.author = this.config.get('author');
    this.module = this.config.get('module');
    this.aws = this.config.get('aws');
    this.lambda = this.config.get('lambda');
    this.git = this.config.get('git');
    this.template('.gitignore');
    this.template('README.md');
    this.template('gulpfile.js');
    this.template('index.js');
    this.template('lambda-config.json');
    this.template('package.json');
    this.directory('src');
  },
  install: function () {
    this.installDependencies({
      bower: false,
      npm: true
    });
  }
});
