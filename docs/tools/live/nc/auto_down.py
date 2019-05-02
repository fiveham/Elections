import requests
import time
import datetime

def fill_blanks(cid=None):
  now = str(datetime.datetime.now())
  day = int(now.split()[0].split('-')[-1])
  hour,minute = (int(x) for x in now.split()[1].split(':')[0:2])
  return (day, hour, minute) if cid is None else (cid, day, hour, minute)

def minute():
  return fill_blanks()[-1]

def all_precincts_have_reported(state_result_list, precinct_result_dict):
  sample = next(iter(state_result_list))
  return (sample['prt'] == sample['ptl'] and 
          all(all('final' in d['sta'].lower() for d in v) for v in precinct_result_dict.values()))

#Fetch data at the statewide level for the election of interest.
#If all precincts have reported, exit
def run():
  election_day = "20190514"
  nc09_counties = {
     4:'Anson',
     9:'Bladen',
    26:'Cumberland',
    60:'Mecklenburg',
    77:'Richmond',
    78:'Robeson',
    83:'Scotland',
    90:'Union'}

  AutoDown(election_day, nc09_counties).run()

class AutoDown:
  def __init__(self, date_string, countyIDs, repo_path, cache_path='./cache/'):
    #if cache_path is falsey, step-by-step results are not cached
    self.base_url = 'https://er.ncsbe.gov/enr/%s/data/' % date_string
    self.countyIDs = list(countyIDs)
    self.repo_path = repo_path + ("" if repo_path.endswith('/') else '/')
    self.cache_path = ((cache_path + '/') 
                       if cache_path and not cache_path.endswith('/') 
                       else cache_path)
    
  def cache_it(self, label, json):
    if not self.cache_path:
      return
    times = fill_blanks()
    content = tuple(label) + times
    with open(self.cache_path + '%s_%d-%d-%d.txt' % content, 'w') as into:
      into.write(str(json)+'\n')
  
  def get_county(self, countyID):
    return requests.get(
      self.base_url + 'results_%d.txt?v=%d-%d-%d' % fill_blanks(countyID)).json()

  def get_state_results(self):
    return self.get_county(0)

  def get_precincts(self, countyID):
    return requests.get(
      self.base_url + 'precinct_%d.txt?v=%d-%d-%d' % fill_blanks(countyID)).json()
  
  def run(self):
    prev_state_results = None
    
    while True:
      prev_minute = minute()
      
      state_results = self.get_state_results()
      precincts = None
      if state_results != prev_state_results:
        prev_state_results = state_results
        print("Change of state")
        self.cache_it("state",state_results)

        counties = {county:self.get_county(county) for county in self.countyIDs}
        self.cache_it("counties",counties)

        precincts = {county:self.get_precincts(county) for county in self.countyIDs}
        self.cache_it("precincts",precincts)

      if all_precincts_have_reported(state_results, precincts):
        print("All precincts reported. Done.")
        return
      
      while minute() == prev_minute:
        time.sleep(10)
      print("Doing it again: "+minute())




