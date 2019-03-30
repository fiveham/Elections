This directory shall contain an html file providing the viewer with an interactive map depicting locations within NC where one can pick up a voter registration form.

Two versions of the html page should be tried, in order to determine which is best:
  KmlLayer version, using google.maps.KmlLayer to display points from a KML file.
    https://fiveham.github.io/Elections/2019/register/nc/reg-sites-kml_0.html
  Data version: using a Data layer instead to exert more control over the content of the map.

Such locations include one-stop (early voting) sites and others according to https://www.ncsbe.gov/Voters/Registering-to-Vote:
  One-stop sites (https://vt.ncsbe.gov/OSSite/GetSites/?CountyID=XX&ElectionDate=04%2F30%2F2019 for CountyID in {28 (Dare), 27 (Currituck), 15 (Camden), 70 (Pasquotank), 72 (Perquimans), 21 (Chowan), 48 (Hyde), 7 (Beaufort), 89 (Tyrrell) 69 (Pamlico), 16 (Carteret), 25 (Craven), 74 (Pitt), 67 (Onslow), 52 (Jones), 54 (Lenoir), 40 (Greene)})
    Source:
      https://vt.ncsbe.gov/OSSite/
    File:
      (none yet)
  Board of Elections offices (NCSBE and county boards)
    Source:
      https://www.ncsbe.gov/contact-us
      https://vt.ncsbe.gov/BOEInfo/PrintableVersion/
    File:
      county-boe.txt
      (plus the NCSBE office address added manually)
        Fields to use: OfficeName, PhysicalAddr1, PhysicalAddr2, PhysicalAddrCSZ
  Public libraries
    Source:
      https://statelibrary.ncdcr.gov/ld/about-libraries/library-directory/download
    File:
      pub-lib.txt
        Fields to use: Branch Name, Street Address, City, ZIP Code
  Public high schools or college admissions offices.
    Source:
      http://apps.schools.nc.gov/eddie
      (Use instructions from http://www.ncpublicschools.org/nceddirectory)
    File:
      high-school-table.txt
        Fields to use: School Name, Address Line1, Address Line2, City, Zip Code 5
  North Carolina Department of Motor Vehicles (NC DMV) (driver license only)
    Source:
      https://www.ncdot.gov/dmv/offices-services/locate-dmv-office/Pages/dmv-offices.aspx
      (Search by county 100 times)
    File:
      license-offices.txt
        Fields to use: Name, Lat, Long, StreetName, City, Zip
  Public Assistance Agencies
    Departments of Social Services (DSS)
      Source:
        https://www.ncdhhs.gov/documents/dss-county-directory
      File:
        dss-table.txt
          Fields to use: Name, AddrLine1, AddrLine2
    Departments of Public Health (WIC)
      Source:
        https://www.nutritionnc.com/wic/directory.htm
        (Search by county, but watch out for multiple counties using the same location, e.g. Ashe & Alleghany)
      File:
        wic-data.txt
          Fields to use: name, sitename, addrline1, addr1_sup, addrline2
  Disability Services Agencies
    Vocational Rehabilitation offices
      Source:
        https://www.ncdhhs.gov/divisions/dvrs/vr-local-offices
      File:
        dds-vr-data.txt
          Fields to use: Office, Address
    Departments of Services for the Blind
      Source:
        https://www.ncdhhs.gov/divisions/dsb/district-offices
      File:
        dsb.txt
          Fields to use: name, addrline1, addr1_sup,, addrline2
    Departments of Services for the Deaf & Hard of Hearing
      Source:
        https://www.ncdhhs.gov/assistance/hearing-loss/regional-centers-for-the-deaf-hard-of-hearing
      File:
        deaf-hard-of-hearing.txt
          Fields to use: name, addrline1, addr1_sup, addrline2
    Departments of Mental Health Services
      Source:
        (Could not find office locations)
      File:
        (none)
    Employment Security Commission (ESC)
      Source:
        (Could not find office locations)
      File:
        (none)
