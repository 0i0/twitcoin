var Config = module.exports = function Config(debug) {
	var config = 
	{ dev :
		{ debug : true
    , orign : 'http://0.0.0.0:5000'
		, sessionSecret : '50m35ecr3t'
		, twitter : 
			{ username:'twitcoinx'
      , password:'twitcoinxxx'
      }
    , apis:
    	{ facebook:
    		{ APP_ID : 'FB_APP_ID'
       	, APP_SECRET : 'FB_APP_SECRET'
        }
	    , twitter:
	    	{ consumer_key: 'Sd5vFIhDDYhV6yOZdlAnaw'
	      , consumer_secret: 'BlZh7MujX0hjD75lm2PbbaeO5J3QZvodCTriDNhwOqs'
	      , token: '1506531-1YLUwv83r8gD65SK44kYytKlbgvGRZVmcI1nS0E'
	      , token_secret: 'SayxpGOnXQjA5vstWwN0Ik57TgQ5QYeCZVYtWntjs'
	      }
	    , google:
	    	{ANALYTICS_ACCOUNT:'UA-XXXXXXXX-X'
	      }
	    }
    }
	, prod :
		{ debug : false
    , orign : 'http://tiwtest.herokuapp.com/'
		, sessionSecret : '50m35ecr3t'
		, twitter : 
			{ username:'twitcoinx'
      , password:'twitcoinxxx'
      }
    , apis:
    	{ facebook:
    		{ APP_ID : 'FB_APP_ID'
       	, APP_SECRET : 'FB_APP_SECRET'
        }
    	, twitter:
	    	{ consumer_key: 'Sd5vFIhDDYhV6yOZdlAnaw'
	      , consumer_secret: 'BlZh7MujX0hjD75lm2PbbaeO5J3QZvodCTriDNhwOqs'
	      , token: '1506531-1YLUwv83r8gD65SK44kYytKlbgvGRZVmcI1nS0E'
	      , token_secret: 'SayxpGOnXQjA5vstWwN0Ik57TgQ5QYeCZVYtWntjs'
	      }
	    , google:
	    	{ANALYTICS_ACCOUNT:'UA-XXXXXXXX-X'
	      }
    	}
    }
  }
  return config[(debug)?'dev':'prod'];
}