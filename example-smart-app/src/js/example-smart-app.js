(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Appointment',
                    query: {
                      patient: patient.id,
                      date: '2017'
                    }
                  });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          console.log(obv);
          // var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          // var height = byCodes('8302-2');
          // var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          // var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          // var hdl = byCodes('2085-9');
          // var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;

          p.appointments = obv.map(appointment => {
              var formatedAppointment = defaultAppointment();
              formatedAppointment.start = appointment.start;
              formatedAppointment.end = appointment.end;
              formatedAppointment.minutesDuration = appointment.minutesDuration;
              formatedAppointment.description = appointment.description;
              formatedAppointment.status = appointment.status;
              formatedAppointment.id = appointment.id;
              return formatedAppointment
            }
          );
          // p.height = getQuantityValueAndUnit(height[0]);

          // if (typeof systolicbp != 'undefined')  {
          //   p.systolicbp = systolicbp;
          // }

          // if (typeof diastolicbp != 'undefined') {
          //   p.diastolicbp = diastolicbp;
          // }

          // p.hdl = getQuantityValueAndUnit(hdl[0]);
          // p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      appointments: [],
    };
  }

  function defaultAppointment(){
    return {
      description: {value: ''},
      start: {value: ''},
      end: {value: ''},
      minutesDuration: {value: ''},
      participant: {value: ''},
      location: {value: ''}
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    var appointmentsHtml = '';
    $.each(p.appointments,function(key,value){
        html +='<tr>';
        html +='<td>'+ value.start + '</td>';
        html +='<td>'+ value.end + '</td>';
        html +='<td>'+ value.minutesDuration + '</td>';
        html +='<td>'+ value.description + '</td>';
        html +='<td>'+ value.status + '</td>';
        html +='<td>'+ value.id + '</td>';
        html +='</tr>';
    });
    $('#appointments').html(appointmentsHtml);
  };

})(window);
