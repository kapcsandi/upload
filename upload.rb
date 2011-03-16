# code: utf-8

require 'rubygems'
require 'sinatra'
require 'sinatra/reloader'
require 'erb'

get '/' do
  erb :index
end

post '/upload' do
  begin
    upload_filepath = request['upload']['filepath']
    original_name = request['upload']['original_name']
    newpath = settings.public + '/uploads/'
    File.rename(upload_filepath, newpath + original_name)
  '{"title": "' + request['title'] + '", "filename": "' + newpath + original_name + '"}'
  rescue
  '{"title": "", "filename": ""}'
  end
end

post '/complete_upload' do
  '{"title": "' + request['title'] + '", "filename": "' + request['filename'] + '"}'
end

