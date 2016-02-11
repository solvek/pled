/**
 * Created by solvek on 11.02.16.
 */

function ensureTrackParams(track){
    if (!track.params){
        track.params = {};
    }
}

module.exports = {
    // General purpose filters

    /**
     * @param {string} proxy For example 'http://192.168.0.1:4000/udp/'
     */
    udpProxy: function(proxy){
        return function(track){
            track.file = track.file.replace('udp://@', proxy);
            return track;
        }
    },

    // Filter conditions
    forStream: function(stream, modifier){
        return function(track, source, collected){
            if (stream != track.file){
                return track;
            }

            return modifier(track, source, collected);
        }
    },

    forSource: function(source, modifier){
        return function(track, sourceActual, collected){
            if (source != sourceActual){
                return track;
            }

            return modifier(track, sourceActual, collected);
        }
    },

    // track modifiers
    remove: function(){
        return undefined;
    },

    setImage: function(image){
      return function(track){
          ensureTrackParams(track);
          track.params.logo = image;
          return track;
      }
    },

    setGroup: function(group){
        return function(track){
            ensureTrackParams(track);
            track.params['group-title'] = group;
            return track;
        }
    }
}
