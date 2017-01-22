jQuery(document).ready(function ($) {

  var $tabs = $('.tabs li');

  $tabs.on('click', function() {
    $('.tabs .is-active').removeClass('is-active');
    $(this).addClass('is-active');
    var sectionToActivate = $(this).data('section');
    $('.content-section').addClass('is-hidden');
    $('#' + sectionToActivate).removeClass('is-hidden');
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function(result) {
    chrome.tabs.sendMessage(result[0].id, {type: "getNetflixBuildID"}, function(buildID) {
      var fetchAllViewedItems = function() {
        var deferred = jQuery.Deferred();
        var viewedItems = [];
        (function fetchPage(page) {
          jQuery.getJSON('https://www.netflix.com/api/shakti/' + buildID + '/viewingactivity?pg=' + page).done(function(json) {
            viewedItems = viewedItems.concat(json.viewedItems);
            console.log('Fetched %s viewed items', viewedItems.length);
            if (json.viewedItems.length == json.size) {
              fetchPage(++page);
            } else {
              deferred.resolve(viewedItems);
            }
          }).fail(deferred.reject);
        })(0);
        return deferred.promise();
      };

      fetchAllViewedItems().then(function(viewedItems) {
        $('#placeholder-container p').text('Calculating...');

        var runningTotal = {
          lastMonth: 0,
          lastYear: 0,
          allTime: 0
        }

        var todayTS = (new Date()).getTime();
        var oneMonthAgoTS = (new Date(todayTS - 30*24*60*60*1000)).getTime();
        var oneYearAgoTS = (new Date(todayTS - 365*24*60*60*1000)).getTime();
        console.log(viewedItems);
        var lastWatched = viewedItems[0];
        var firstWatched = viewedItems[viewedItems.length - 1];
        if (typeof lastWatched.series === 'undefined') {
          $('#last-item-watched').text(`The last item you watched was ${lastWatched.title} on ${lastWatched.dateStr}.`);
        } else {
          $('#last-item-watched').text(`The last item you watched was ${lastWatched.seriesTitle}, ${lastWatched.title} on ${lastWatched.dateStr}.`);
        }

        if (typeof firstWatched.series === 'undefined') {
          $('#first-item-watched').text(`The first item you watched was ${firstWatched.title} on ${firstWatched.dateStr}.`);
        } else {
          $('#first-item-watched').text(`The first item you watched was ${firstWatched.seriesTitle}, ${firstWatched.title} on ${firstWatched.dateStr}.`);
        }


        for (item of viewedItems) {
          if (item.date > oneMonthAgoTS) { runningTotal.lastMonth += item.bookmark }
          if (item.date > oneYearAgoTS) { runningTotal.lastYear += item.bookmark }
          runningTotal.allTime += item.bookmark;
        }

        $('#placeholder-container').addClass('is-hidden');
        $('#main-content').removeClass('is-hidden');

        var lastMonth = {
          days: Math.floor(runningTotal.lastMonth / 60 / 60 / 24),
          hours: Math.floor((runningTotal.lastMonth / 60 / 60) % 24),
          minutes: Math.round((runningTotal.lastMonth / 60) % 60)
        };
        $('#last-month-spent').text(`Over the last month you have watched ${lastMonth.days} days, ${lastMonth.hours} hours and ${lastMonth.minutes} minutes of Netflix.`);

        var lastYear = {
          days: Math.floor(runningTotal.lastYear / 60 / 60 / 24),
          hours: Math.floor((runningTotal.lastYear / 60 / 60) % 24),
          minutes: Math.round((runningTotal.lastYear / 60) % 60)
        };
        $('#last-year-spent').text(`Over the last year you have watched ${lastYear.days} days, ${lastYear.hours} hours and ${lastYear.minutes} minutes of Netflix.`);

        var allTime = {
          days: Math.floor(runningTotal.allTime / 60 / 60 / 24),
          hours: Math.floor((runningTotal.allTime / 60 / 60) % 24),
          minutes: Math.round((runningTotal.allTime / 60) % 60)
        };
        $('#all-time-spent').text(`You have cumulatively watched ${allTime.days} days, ${allTime.hours} hours and ${allTime.minutes} minutes of Netflix.`);
      });
    });
  });
});