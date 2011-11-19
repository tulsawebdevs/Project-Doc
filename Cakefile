fs = require 'fs'
{print} = require 'util'
{spawn, exec} = require 'child_process'

task 'docs', 'Generate annotated source code with Docco', ->
  fs.readdir 'libsrc', (err, contents) ->
    files = ("libsrc/#{file}" for file in contents when /\.coffee$/.test file)
    docco = spawn 'docco', files
    docco.stdout.on 'data', (data) -> print data.toString()
    docco.stderr.on 'data', (data) -> print data.toString()
    docco.on 'exit', (status) -> callback?() if status is 0